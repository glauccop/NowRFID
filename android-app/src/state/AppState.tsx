import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { debugLog } from '../debug/debugLog';
import { serviceNow } from '../network/serviceNow';
import {
  BarcodeRead,
  isQrSymbology,
  reader,
  ReaderInfo,
  TagRead,
} from '../reader/chainway';
import { store } from '../storage/store';
import { mergeStructure } from '../structure/tree';
import {
  AssetType,
  CaptureContext,
  ConnectionState,
  DEFAULT_SETTINGS,
  Operation,
  ScanBatch,
  ScanItem,
  Settings,
  Structure,
} from '../types';
import { inferSymbology, normalizeRssi } from '../utils/codes';
import { uuid } from '../utils/ids';

interface Connection {
  status: ConnectionState;
  address: string;
}

interface State {
  ready: boolean;
  settings: Settings;
  connection: Connection;
  readerInfo: ReaderInfo;
  batch: ScanBatch;
  history: ScanBatch[];
  structure: Structure | null;
  assetTypes: AssetType[];
  captureContext: CaptureContext | null;
}

type Action =
  | {
      type: 'loaded';
      settings: Settings;
      batch: ScanBatch | null;
      history: ScanBatch[];
      structure: Structure | null;
      assetTypes: AssetType[];
      captureContext: CaptureContext | null;
    }
  | { type: 'synced'; structure: Structure; assetTypes: AssetType[] }
  | { type: 'captureContext'; context: CaptureContext | null }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'connection'; connection: Connection }
  | { type: 'readerInfo'; info: ReaderInfo }
  | { type: 'addItems'; items: ScanItem[] }
  | { type: 'removeItem'; id: string }
  | { type: 'notes'; notes: string }
  | { type: 'batchStatus'; status: ScanBatch['status']; error?: string }
  | { type: 'batchSent'; serverNumber: string }
  | { type: 'newBatch' };

const HISTORY_LIMIT = 30;

const POST_CONNECT_DELAY_MS = 1000;
const POST_CONNECT_ATTEMPTS = 3;

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/** The SDK reports -1 / '' for values it could not read. */
function normalizeReaderInfo(info: ReaderInfo): ReaderInfo {
  const out: ReaderInfo = {};
  for (const [key, val] of Object.entries(info) as [
    keyof ReaderInfo,
    unknown,
  ][]) {
    if (val !== -1 && val !== '' && val !== null && val !== undefined) {
      (out as Record<string, unknown>)[key] = val;
    }
  }
  return out;
}

/**
 * The R6 rejects commands sent right after the BLE link comes up (field log:
 * setEPCAndTIDMode=false, all reader info -1). Wait, then retry until it answers.
 */
async function setupAfterConnect(
  isCancelled: () => boolean,
  includeTid: boolean,
  onInfo: (info: ReaderInfo) => void,
) {
  let modeOk = false;
  let infoOk = false;
  for (
    let attempt = 1;
    attempt <= POST_CONNECT_ATTEMPTS && !(modeOk && infoOk);
    attempt++
  ) {
    await sleep(POST_CONNECT_DELAY_MS * attempt);
    if (isCancelled()) {
      return;
    }
    if (!modeOk) {
      modeOk = await reader.setInventoryMode(includeTid).catch(() => false);
    }
    if (!infoOk) {
      const info = normalizeReaderInfo(
        await reader.getReaderInfo().catch(() => ({})),
      );
      infoOk = info.battery !== undefined || info.version !== undefined;
      onInfo(info);
    }
  }
  if (!modeOk || !infoOk) {
    debugLog.log('app', 'err', 'Configuração pós-conexão incompleta', {
      inventoryModeApplied: modeOk,
      readerInfoRead: infoOk,
    });
  }
}

function emptyBatch(): ScanBatch {
  return {
    id: uuid(),
    createdAt: new Date().toISOString(),
    notes: '',
    items: [],
    status: 'open',
  };
}

function mergeKey(item: ScanItem): string | null {
  if (item.operation !== 'read') {
    return null;
  }
  if (item.captureType === 'rfid') {
    return item.epc ? `rfid:${item.epc}` : null;
  }
  return item.barcodeValue
    ? `${item.captureType}:${item.symbology}:${item.barcodeValue}`
    : null;
}

export function mergeItems(
  existing: ScanItem[],
  incoming: ScanItem[],
): ScanItem[] {
  const result = [...existing];
  const index = new Map<string, number>();
  result.forEach((it, i) => {
    const key = mergeKey(it);
    if (key) {
      index.set(key, i);
    }
  });
  for (const item of incoming) {
    const key = mergeKey(item);
    const at = key ? index.get(key) : undefined;
    if (at === undefined) {
      if (key) {
        index.set(key, result.length);
      }
      result.push(item);
    } else {
      const prev = result[at];
      result[at] = {
        ...prev,
        readCount: prev.readCount + item.readCount,
        rssi: item.rssi || prev.rssi,
        tid: prev.tid || item.tid,
        userData: prev.userData || item.userData,
      };
    }
  }
  return result;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loaded':
      return {
        ...state,
        ready: true,
        settings: action.settings,
        batch: action.batch ?? emptyBatch(),
        history: action.history,
        structure: action.structure,
        assetTypes: action.assetTypes,
        captureContext: action.captureContext,
      };
    case 'synced':
      return {
        ...state,
        structure: action.structure,
        assetTypes: action.assetTypes,
      };
    case 'captureContext':
      return { ...state, captureContext: action.context };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'connection':
      return {
        ...state,
        connection: action.connection,
        readerInfo:
          action.connection.status === 'connected' ? state.readerInfo : {},
      };
    case 'readerInfo':
      return { ...state, readerInfo: { ...state.readerInfo, ...action.info } };
    case 'addItems':
      if (state.batch.status === 'sending') {
        return state;
      }
      return {
        ...state,
        batch: {
          ...state.batch,
          status: 'open',
          items: mergeItems(
            state.batch.items,
            stampContext(action.items, state.captureContext),
          ),
        },
      };
    case 'removeItem':
      return {
        ...state,
        batch: {
          ...state.batch,
          items: state.batch.items.filter(i => i.id !== action.id),
        },
      };
    case 'notes':
      return { ...state, batch: { ...state.batch, notes: action.notes } };
    case 'batchStatus':
      return {
        ...state,
        batch: {
          ...state.batch,
          status: action.status,
          lastError: action.error,
        },
      };
    case 'batchSent': {
      const sent: ScanBatch = {
        ...state.batch,
        status: 'sent',
        sentAt: new Date().toISOString(),
        serverNumber: action.serverNumber,
        lastError: undefined,
      };
      return {
        ...state,
        batch: emptyBatch(),
        history: [sent, ...state.history].slice(0, HISTORY_LIMIT),
      };
    }
    case 'newBatch':
      return { ...state, batch: emptyBatch() };
  }
}

/** Items inherit the room / asset type selected before the scanner was started. */
export function stampContext(
  items: ScanItem[],
  context: CaptureContext | null,
): ScanItem[] {
  if (!context) {
    return items;
  }
  return items.map(item => ({
    ...item,
    location: item.location ?? context.location,
    assetType: item.assetType ?? context.assetType,
  }));
}

export function tagToItem(
  tag: TagRead,
  operation: Operation = 'read',
  extra: Record<string, unknown> = {},
): ScanItem {
  return {
    id: uuid(),
    captureType: 'rfid',
    operation,
    epc: tag.epc,
    tid: tag.tid || undefined,
    userData: tag.user || undefined,
    rssi: normalizeRssi(tag.rssi),
    readCount: Math.max(1, tag.count || 1),
    capturedAt: new Date(tag.timestamp || Date.now()).toISOString(),
    raw: { ...tag, ...extra },
  };
}

export function barcodeToItem(code: BarcodeRead): ScanItem {
  const symbology = code.symbology || inferSymbology(code.value);
  return {
    id: uuid(),
    captureType: isQrSymbology(symbology) ? 'qr' : 'barcode',
    operation: 'read',
    barcodeValue: code.value,
    symbology,
    readCount: 1,
    capturedAt: new Date().toISOString(),
    raw: { ...code },
  };
}

interface AppContextValue extends State {
  updateSettings: (patch: Partial<Settings>) => void;
  addItems: (items: ScanItem[]) => void;
  removeItem: (id: string) => void;
  setNotes: (notes: string) => void;
  newBatch: () => void;
  sendBatch: () => Promise<void>;
  refreshReaderInfo: () => Promise<void>;
  syncStructure: (full?: boolean) => Promise<void>;
  setCaptureContext: (context: CaptureContext | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ready: false,
    settings: DEFAULT_SETTINGS,
    connection: { status: 'disconnected', address: '' },
    readerInfo: {},
    batch: emptyBatch(),
    history: [],
    structure: null,
    assetTypes: [],
    captureContext: null,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      const [settings, batch, history, structure, assetTypes, captureContext] =
        await Promise.all([
          store.loadSettings(),
          store.loadBatch(),
          store.loadHistory(),
          store.loadStructure(),
          store.loadAssetTypes(),
          store.loadCaptureContext(),
        ]);
      debugLog.setEnabled(settings.debugEnabled);
      // A batch interrupted mid-send is still pending on the device: let the user resend it.
      const restored =
        batch && batch.status === 'sending'
          ? {
              ...batch,
              status: 'error' as const,
              lastError: 'Envio interrompido',
            }
          : batch;
      dispatch({
        type: 'loaded',
        settings,
        batch: restored,
        history,
        structure,
        assetTypes,
        captureContext,
      });
      reader
        .init()
        .catch(e => debugLog.log('app', 'err', 'reader.init', String(e)));
    })();
  }, []);

  useEffect(() => {
    if (state.ready) {
      store.saveSettings(state.settings);
      debugLog.setEnabled(state.settings.debugEnabled);
    }
  }, [state.ready, state.settings]);

  useEffect(() => {
    if (state.ready) {
      store.saveBatch(state.batch);
    }
  }, [state.ready, state.batch]);

  useEffect(() => {
    if (state.ready) {
      store.saveCaptureContext(state.captureContext);
    }
  }, [state.ready, state.captureContext]);

  useEffect(() => {
    if (state.ready) {
      store.saveHistory(state.history);
    }
  }, [state.ready, state.history]);

  const refreshReaderInfo = useCallback(async () => {
    try {
      dispatch({
        type: 'readerInfo',
        info: normalizeReaderInfo(await reader.getReaderInfo()),
      });
    } catch (e) {
      debugLog.log('app', 'err', 'getReaderInfo', String(e));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sub = reader.onConnection(evt => {
      dispatch({
        type: 'connection',
        connection: { status: evt.status, address: evt.address },
      });
      if (evt.status === 'connected') {
        cancelled = false;
        setupAfterConnect(
          () => cancelled,
          stateRef.current.settings.includeTid,
          info => dispatch({ type: 'readerInfo', info }),
        );
      } else {
        cancelled = true;
      }
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const sendBatch = useCallback(async () => {
    const { batch, settings, connection } = stateRef.current;
    if (!batch.items.length || batch.status === 'sending') {
      return;
    }
    dispatch({ type: 'batchStatus', status: 'sending' });
    try {
      const { data } = await serviceNow.sendBatch(settings, batch, {
        deviceId: settings.installId,
        readerMac: connection.address || settings.lastDeviceAddress,
      });
      const failed = data.errors?.length ?? 0;
      debugLog.log(
        'app',
        failed ? 'err' : 'info',
        `Lote ${data.batch_number} enviado`,
        data,
      );
      dispatch({ type: 'batchSent', serverNumber: data.batch_number });
    } catch (e) {
      dispatch({
        type: 'batchStatus',
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }, []);

  /** Downloads the location tree (incremental unless `full`) and the asset types for offline use. */
  const syncStructure = useCallback(async (full = false) => {
    const { settings, structure: cached } = stateRef.current;
    const since = !full && cached ? cached.serverTime : undefined;
    const [{ data: tree }, { data: types }] = await Promise.all([
      serviceNow.getStructure(settings, since),
      serviceNow.getAssetTypes(settings),
    ]);
    const structure = mergeStructure(
      cached,
      {
        root: tree.root,
        serverTime: tree.server_time,
        syncedAt: '',
        locations: tree.locations,
      },
      !since,
    );
    const assetTypes = [...types.types].sort((a, b) => a.order - b.order);
    await Promise.all([
      store.saveStructure(structure),
      store.saveAssetTypes(assetTypes),
    ]);
    dispatch({ type: 'synced', structure, assetTypes });
    debugLog.log('app', 'info', 'Estrutura sincronizada', {
      locations: structure.locations.length,
      assetTypes: assetTypes.length,
      incremental: !!since,
    });
  }, []);

  // Stable identities: screens subscribe to reader events with these in effect deps.
  const actions = useMemo(
    () => ({
      updateSettings: (patch: Partial<Settings>) =>
        dispatch({ type: 'settings', patch }),
      addItems: (items: ScanItem[]) => {
        if (items.length) {
          dispatch({ type: 'addItems', items });
        }
      },
      removeItem: (id: string) => dispatch({ type: 'removeItem', id }),
      setNotes: (notes: string) => dispatch({ type: 'notes', notes }),
      newBatch: () => dispatch({ type: 'newBatch' }),
      setCaptureContext: (context: CaptureContext | null) =>
        dispatch({ type: 'captureContext', context }),
    }),
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      ...actions,
      sendBatch,
      refreshReaderInfo,
      syncStructure,
    }),
    [state, actions, sendBatch, refreshReaderInfo, syncStructure],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppStateProvider');
  }
  return ctx;
}
