import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { reader } from '../reader/chainway';
import { barcodeToItem, tagToItem, useApp } from '../state/AppState';
import { Button, colors, Muted, Segmented, styles } from '../ui/components';
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
        addItems([barcodeToItem(code)]);
      }
    } catch (e) {
      Alert.alert('Código de barras/QR', String(e));
    } finally {
      setScanningCode(false);
    }
  }, [addItems]);

  useEffect(() => {
    const tags = reader.onTags(list =>
      addItems(list.filter(t => t.epc).map(t => tagToItem(t))),
    );
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

  return (
    <View style={s.container}>
      <View style={s.summary}>
        <View style={styles.flex1}>
          <Text style={s.summaryPath} numberOfLines={2}>
            {captureContext?.locationPath.slice(1).join(' › ') ||
              captureContext?.locationPath.join(' › ')}
          </Text>
          <Text style={s.summaryType}>
            {type ? `${type.icon} ${type.name}` : '❔ Classificar depois'}
          </Text>
          <Text style={s.summaryCount}>
            {rfidCount} RFID · {items.length - rfidCount} códigos aqui ·{' '}
            {batch.items.length} no lote
          </Text>
        </View>
        <Button
          title="Alterar"
          variant="secondary"
          disabled={inventorying || scanningCode}
          onPress={onChangeSelection}
        />
      </View>

      {!connected && (
        <Text style={s.warning}>
          Conecte o leitor R6 na aba "Conectar" para escanear.
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
          <View style={styles.wrap}>
            <Button
              title={
                inventorying ? 'Parar leitura' : 'Iniciar leitura contínua'
              }
              variant={inventorying ? 'danger' : 'primary'}
              disabled={!connected}
              onPress={inventorying ? stopInventory : startInventory}
            />
            <Button
              title="Leitura única"
              variant="secondary"
              disabled={!connected || inventorying}
              onPress={readSingle}
            />
          </View>
        ) : (
          <View style={styles.wrap}>
            <Button
              title="Ler código"
              disabled={!connected}
              busy={scanningCode}
              onPress={scanCode}
            />
            {scanningCode && (
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => reader.stopBarcode()}
              />
            )}
          </View>
        )}
        <Muted>
          O gatilho físico do R6 dispara a leitura no modo selecionado.
        </Muted>
      </View>

      <FlatList
        style={s.list}
        contentContainerStyle={s.listContent}
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <ItemRow item={item} />}
        ListEmptyComponent={
          <Muted>Nenhum item registrado neste local e tipo ainda.</Muted>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryPath: { fontSize: 15, fontWeight: '800', color: colors.text },
  summaryType: { fontSize: 15, color: colors.primary, fontWeight: '700' },
  summaryCount: { fontSize: 12, color: colors.muted },
  warning: { color: colors.warning, paddingHorizontal: 12, paddingTop: 8 },
  controls: { padding: 12, gap: 8 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 12, paddingBottom: 12, gap: 2 },
});
