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
import { reader } from '../reader/chainway';
import { barcodeToItem, tagToItem, useApp } from '../state/AppState';
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
  const [mode, setMode] = useState<Mode>('rfid');
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

  const readSingle = async () => {
    try {
      const tag = await reader.inventorySingle();
      if (tag?.epc) {
        addItems([tagToItem(tag)]);
      } else {
        Alert.alert('Leitura única', 'Nenhuma tag encontrada.');
      }
    } catch (e) {
      Alert.alert('Leitura única', String(e));
    }
  };

  const scanCode = useCallback(async () => {
    setScanningCode(true);
    try {
      const code = await reader.scanBarcode();
      if (code?.value) {
        Vibration.vibrate(30);
        addItems([barcodeToItem(code)]);
      }
    } catch (e) {
      Alert.alert('Código de barras/QR', String(e));
    } finally {
      setScanningCode(false);
    }
  }, [addItems]);

  // Haptic confirmation only for tags not yet in the batch (re-reads stay silent).
  const knownEpcs = useRef(new Set<string>());
  knownEpcs.current = new Set(
    batch.items.filter(i => i.epc).map(i => i.epc as string),
  );

  useEffect(() => {
    const tags = reader.onTags(list => {
      const fresh = list.filter(t => t.epc);
      if (fresh.some(t => !knownEpcs.current.has(t.epc))) {
        Vibration.vibrate(30);
      }
      addItems(fresh.map(t => tagToItem(t)));
    });
    return () => tags.remove();
  }, [addItems]);

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
        inventoryRef.current ? stopInventory() : startInventory();
      } else if (!scanningCode) {
        scanCode();
      }
    });
    return () => sub.remove();
  }, [mode, scanningCode, startInventory, stopInventory, scanCode]);

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
            (i.assetType ?? '') === (captureContext?.assetType ?? ''),
        )
        .reverse(),
    [batch.items, captureContext],
  );
  const rfidCount = items.filter(i => i.captureType === 'rfid').length;
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
            {rfidCount} RFID · {items.length - rfidCount} códigos aqui ·{' '}
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

      {mode === 'rfid' ? (
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
