import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  MapPin,
  Pencil,
  Play,
  ScanBarcode,
  ScanLine,
  Square,
  Tag,
} from 'lucide-react-native';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { reader, TagRead } from '../reader/chainway';
import { barcodeToItem, tagToItem, useApp } from '../state/AppState';
import { useToast } from '../ui/toast';
import { Button, EmptyState, Fab, Segmented } from '../ui/components';
import { color, font, fontSize, palette, space } from '../ui/theme';
import { ItemRow } from './ItemRow';
import { PrepareCapture } from './PrepareCapture';

type Mode = 'rfid' | 'barcode';

/** Entry of the capture flow: prepare (room + asset type) first, then scan. */
export function ScanScreen() {
  const { captureContext } = useApp();
  const [preparing, setPreparing] = useState(!captureContext);
  if (preparing || !captureContext) {
    return <PrepareCapture onStart={() => setPreparing(false)} />;
  }
  return <ScannerView onChangeSelection={() => setPreparing(true)} />;
}

export function ScannerView({
  onChangeSelection,
}: {
  onChangeSelection: () => void;
}) {
  const { connection, batch, addItems, captureContext, assetTypes } = useApp();
  const pairing = captureContext?.mode === 'existing';
  // Pairing starts with the plaqueta: read its barcode, then the tag of the same item.
  const [mode, setMode] = useState<Mode>(pairing ? 'barcode' : 'rfid');
  const [plaqueta, setPlaqueta] = useState('');
  const plaquetaRef = useRef('');
  plaquetaRef.current = plaqueta;
  const toast = useToast();
  const [inventorying, setInventorying] = useState(false);
  const [scanningCode, setScanningCode] = useState(false);
  const inventoryRef = useRef(false);
  const connected = connection.status === 'connected';

  const startInventory = useCallback(async () => {
    try {
      if (await reader.startInventory()) {
        inventoryRef.current = true;
        setInventorying(true);
      } else {
        Alert.alert('Leitura RFID', 'O leitor recusou iniciar o inventário.');
      }
    } catch (e) {
      Alert.alert('Leitura RFID', String(e));
    }
  }, []);

  const stopInventory = useCallback(async () => {
    inventoryRef.current = false;
    setInventorying(false);
    await reader.stopInventory().catch(() => undefined);
  }, []);

  // Haptic confirmation only for tags not yet in the batch (re-reads stay silent).
  const knownEpcs = useRef(new Set<string>());
  knownEpcs.current = new Set(
    batch.items.filter(i => i.epc).map(i => i.epc as string),
  );

  /**
   * Normal mode: every tag goes to the batch. Pairing mode: only a single new tag read right after
   * a plaqueta is accepted, and it carries that número de patrimônio; tags already in the batch
   * are just re-reads.
   */
  const acceptTags = useCallback(
    (list: TagRead[]) => {
      const tags = list.filter(t => t.epc);
      const fresh = tags.filter(t => !knownEpcs.current.has(t.epc));
      if (!pairing) {
        if (fresh.length) {
          Vibration.vibrate(30);
        }
        addItems(tags.map(t => tagToItem(t)));
        return;
      }
      addItems(
        tags.filter(t => knownEpcs.current.has(t.epc)).map(t => tagToItem(t)),
      );
      if (!fresh.length) {
        return;
      }
      const assetTag = plaquetaRef.current;
      if (!assetTag) {
        toast('Leia primeiro o código da plaqueta');
        return;
      }
      if (fresh.length > 1) {
        toast('Mais de uma tag no alcance — aproxime só a do bem');
        return;
      }
      Vibration.vibrate(60);
      addItems([{ ...tagToItem(fresh[0]), assetTag }]);
      setPlaqueta('');
      toast(`Tag vinculada ao patrimônio ${assetTag}`);
      setMode('barcode');
    },
    [addItems, pairing, toast],
  );

  const readSingle = useCallback(async () => {
    try {
      const tag = await reader.inventorySingle();
      if (tag?.epc) {
        acceptTags([tag]);
      } else {
        Alert.alert('Leitura única', 'Nenhuma tag encontrada.');
      }
    } catch (e) {
      Alert.alert('Leitura única', String(e));
    }
  }, [acceptTags]);

  const scanCode = useCallback(async () => {
    setScanningCode(true);
    try {
      const code = await reader.scanBarcode();
      if (code?.value) {
        Vibration.vibrate(30);
        if (pairing) {
          setPlaqueta(code.value.trim());
          setMode('rfid');
        } else {
          addItems([barcodeToItem(code)]);
        }
      }
    } catch (e) {
      Alert.alert('Código de barras/QR', String(e));
    } finally {
      setScanningCode(false);
    }
  }, [addItems, pairing]);

  useEffect(() => {
    const tags = reader.onTags(acceptTags);
    return () => tags.remove();
  }, [acceptTags]);

  // Stop the radio only when leaving the screen, never on re-subscription.
  useEffect(
    () => () => {
      if (inventoryRef.current) {
        inventoryRef.current = false;
        reader.stopInventory().catch(() => undefined);
      }
    },
    [],
  );

  // Physical trigger on the R6: RFID mode toggles inventory, barcode mode fires the imager.
  useEffect(() => {
    const sub = reader.onTrigger(evt => {
      if (evt.action !== 'down') {
        return;
      }
      if (mode === 'rfid') {
        // Pairing needs exactly one tag: the trigger does a single read instead of an inventory.
        if (pairing) {
          readSingle();
        } else {
          inventoryRef.current ? stopInventory() : startInventory();
        }
      } else if (!scanningCode) {
        scanCode();
      }
    });
    return () => sub.remove();
  }, [
    mode,
    pairing,
    scanningCode,
    startInventory,
    stopInventory,
    scanCode,
    readSingle,
  ]);

  const changeMode = (m: Mode) => {
    if (inventoryRef.current) {
      stopInventory();
    }
    setMode(m);
  };

  const type = assetTypes.find(t => t.sys_id === captureContext?.assetType);
  // Newest first; re-reads only bump the counter in place so the list doesn't jump.
  const items = useMemo(
    () =>
      batch.items
        .filter(
          i =>
            i.location === captureContext?.location &&
            (i.stockroom ?? '') === (captureContext?.stockroom ?? '') &&
            (i.assetType ?? '') === (captureContext?.assetType ?? ''),
        )
        .reverse(),
    [batch.items, captureContext],
  );
  const rfidCount = items.filter(i => i.captureType === 'rfid').length;
  const reads = items.reduce((n, i) => n + i.readCount, 0);
  const path =
    captureContext?.locationPath.slice(1).join(' › ') ||
    captureContext?.locationPath.join(' › ');

  return (
    <View style={s.container}>
      <View style={s.summary}>
        <View style={s.summaryText}>
          <View style={s.line}>
            <MapPin size={16} color={palette.primary1} />
            <Text style={s.summaryPath} numberOfLines={2}>
              {path}
            </Text>
          </View>
          <View style={s.line}>
            <Tag size={16} color={palette.primary1} />
            <Text style={s.summaryType}>
              {type ? `${type.icon} ${type.name}` : '❔ Classificar depois'}
            </Text>
          </View>
          <Text style={s.summaryCount}>
            {rfidCount} {rfidCount === 1 ? 'etiqueta' : 'etiquetas'} ·{' '}
            {items.length - rfidCount} códigos · {reads} leituras ·{' '}
            {batch.items.length} no lote
          </Text>
        </View>
        <Button
          title="Alterar"
          icon={Pencil}
          variant="secondary"
          disabled={inventorying || scanningCode}
          onPress={onChangeSelection}
        />
      </View>

      {pairing && (
        <Text style={s.pairing}>
          {plaqueta
            ? `Plaqueta ${plaqueta} lida — agora leia a tag RFID do bem.`
            : 'Vincular: leia o código de barras da plaqueta do bem.'}
        </Text>
      )}

      {!connected && (
        <Text style={s.warning}>
          Leitor desconectado: toque em "Conectar leitor" no topo.
        </Text>
      )}

      <View style={s.controls}>
        <Segmented
          value={mode}
          onChange={changeMode}
          options={[
            { value: 'rfid', label: 'RFID UHF' },
            { value: 'barcode', label: 'Barcode / QR' },
          ]}
        />
        {mode === 'rfid' ? (
          <Button
            title="Leitura única"
            variant="tertiary"
            disabled={!connected || inventorying}
            onPress={readSingle}
          />
        ) : (
          scanningCode && (
            <Button
              title="Cancelar leitura"
              variant="tertiary"
              onPress={() => reader.stopBarcode()}
            />
          )
        )}
      </View>

      <FlatList
        style={s.list}
        contentContainerStyle={s.listContent}
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <ItemRow item={item} />}
        ListEmptyComponent={
          <EmptyState
            icon={ScanLine}
            title="Nenhum item neste local ainda"
            message="Aperte o gatilho do R6 ou o botão abaixo para começar a leitura."
          />
        }
      />

      {mode === 'rfid' && pairing ? (
        <Fab
          icon={Tag}
          label="Ler tag do bem"
          disabled={!connected}
          onPress={readSingle}
        />
      ) : mode === 'rfid' ? (
        <Fab
          icon={inventorying ? Square : Play}
          label={inventorying ? 'Parar leitura' : 'Iniciar leitura contínua'}
          variant={inventorying ? 'danger' : 'primary'}
          disabled={!connected}
          onPress={inventorying ? stopInventory : startInventory}
        />
      ) : (
        <Fab
          icon={ScanBarcode}
          label={scanningCode ? 'Lendo…' : 'Ler código'}
          disabled={!connected || scanningCode}
          onPress={scanCode}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm2,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  summaryText: { flex: 1, gap: space.xxs },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  summaryPath: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: fontSize.md1,
    color: color.textPrimary,
  },
  summaryType: {
    fontFamily: font.bold,
    fontSize: fontSize.md1,
    color: palette.primary2,
  },
  summaryCount: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: color.textTertiary,
  },
  pairing: {
    fontFamily: font.bold,
    color: palette.primary2,
    backgroundColor: palette.primary0,
    paddingHorizontal: space.sm2,
    paddingVertical: space.sm,
  },
  warning: {
    fontFamily: font.bold,
    color: palette.high3,
    backgroundColor: palette.high0,
    paddingHorizontal: space.sm2,
    paddingVertical: space.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.sm2,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: space.sm2, paddingBottom: 96 },
});
