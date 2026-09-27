import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import {
  AssetType,
  CaptureContext,
  DEFAULT_SETTINGS,
  LEGACY_API_PATH,
  ScanBatch,
  Settings,
  Structure,
} from '../types';
import { uuid } from '../utils/ids';

const storage = createAsyncStorage('nowrfid');

const KEYS = {
  settings: 'settings',
  batch: 'currentBatch',
  history: 'history',
  structure: 'structure',
  assetTypes: 'assetTypes',
  captureContext: 'captureContext',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const store = {
  loadSettings: async (): Promise<Settings> => {
    const settings = {
      ...DEFAULT_SETTINGS,
      ...(await readJson<Partial<Settings>>(KEYS.settings, {})),
    };
    // Scope was renamed x_nowrfid -> x_snc_nowrfid (instance vendor prefix).
    if (settings.apiPath === LEGACY_API_PATH) {
      settings.apiPath = DEFAULT_SETTINGS.apiPath;
    }
    return settings.installId ? settings : { ...settings, installId: uuid() };
  },
  saveSettings: (s: Settings) =>
    storage.setItem(KEYS.settings, JSON.stringify(s)),
  loadBatch: () => readJson<ScanBatch | null>(KEYS.batch, null),
  saveBatch: (b: ScanBatch) => storage.setItem(KEYS.batch, JSON.stringify(b)),
  loadHistory: () => readJson<ScanBatch[]>(KEYS.history, []),
  saveHistory: (h: ScanBatch[]) =>
    storage.setItem(KEYS.history, JSON.stringify(h)),
  loadStructure: () => readJson<Structure | null>(KEYS.structure, null),
  saveStructure: (s: Structure) =>
    storage.setItem(KEYS.structure, JSON.stringify(s)),
  loadAssetTypes: () => readJson<AssetType[]>(KEYS.assetTypes, []),
  saveAssetTypes: (t: AssetType[]) =>
    storage.setItem(KEYS.assetTypes, JSON.stringify(t)),
  loadCaptureContext: () =>
    readJson<CaptureContext | null>(KEYS.captureContext, null),
  saveCaptureContext: (c: CaptureContext | null) =>
    c
      ? storage.setItem(KEYS.captureContext, JSON.stringify(c))
      : storage.removeItem(KEYS.captureContext),
};
