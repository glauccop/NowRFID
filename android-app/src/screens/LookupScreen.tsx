import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Text, Vibration, View } from 'react-native';
import {
  Camera,
  PackageSearch,
  ScanBarcode,
  ScanLine,
  Search,
} from 'lucide-react-native';
import { reader } from '../reader/chainway';
import {
  LookupAsset,
  LookupResult,
  serviceNow,
  ServiceNowError,
} from '../network/serviceNow';
import { useApp } from '../state/AppState';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  KeyValue,
  Muted,
  Screen,
  Segmented,
  styles,
} from '../ui/components';
import { color } from '../ui/theme';

type Mode = 'rfid' | 'barcode';

const MATCHED_BY: Record<string, string> = {
  tag_epc: 'Encontrado pela etiqueta RFID (EPC)',
  tag_tid: 'Encontrado pelo TID da etiqueta',
  asset_tag: 'Encontrado pelo número de patrimônio / série',
};

const CLASSIFICATION: Record<string, string> = {
  pending: 'pendente de classificação',
  classified: 'classificado, aguardando criação do ativo',
  promoted: 'ativo criado',
  ignored: 'ignorado',
};

interface Scanned {
  epc?: string;
  tid?: string;
  barcode?: string;
}

/** Scan an RFID tag or a barcode/QR, then ask ServiceNow where that asset is registered. */
export function LookupScreen() {
  const { settings, connection } = useApp();
  const connected = connection.status === 'connected';
  const [mode, setMode] = useState<Mode>('rfid');
  const [scanned, setScanned] = useState<Scanned>({});
  const [manual, setManual] = useState('');
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState('');
  const readingRef = useRef(false);

  const clearResult = () => {
    setResult(null);
    setError('');
  };

  const read = useCallback(
    async (source: 'reader' | 'camera' = 'reader') => {
      if (readingRef.current) {
        return;
      }
      readingRef.current = true;
      setReading(true);
      try {
        if (mode === 'rfid') {
          const tag = await reader.inventorySingle();
          if (tag?.epc) {
            Vibration.vibrate(30);
            setScanned({ epc: tag.epc, tid: tag.tid || undefined });
            setManual('');
            clearResult();
          } else {
            Alert.alert('Leitura RFID', 'Nenhuma tag encontrada.');
          }
        } else {
          const code =
            source === 'camera'
              ? await reader.scanCamera()
              : await reader.scanBarcode();
          if (code?.value) {
            Vibration.vibrate(30);
            setScanned({ barcode: code.value.trim() });
            setManual(code.value.trim());
            clearResult();
          }
        }
      } catch (e) {
        Alert.alert('Leitura', String(e));
      } finally {
        readingRef.current = false;
        setReading(false);
      }
    },
    [mode],
  );

  // The R6 trigger reads in the active mode.
  useEffect(() => {
    const sub = reader.onTrigger(evt => {
      if (evt.action === 'down') {
        read('reader');
      }
    });
    return () => sub.remove();
  }, [read]);

  const query: Scanned =
    mode === 'barcode' && manual.trim() ? { barcode: manual.trim() } : scanned;
  const hasQuery = !!(query.epc || query.tid || query.barcode);

  const search = async () => {
    setBusy(true);
    clearResult();
    try {
      const { data } = await serviceNow.lookupAsset(settings, query);
      setResult(data);
    } catch (e) {
      setError(e instanceof ServiceNowError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Card title="Ler etiqueta ou código" icon={ScanLine}>
        <Segmented<Mode>
          value={mode}
          onChange={m => {
            setMode(m);
            setScanned({});
            setManual('');
            clearResult();
          }}
          options={[
            { value: 'rfid', label: 'RFID' },
            { value: 'barcode', label: 'Código de barras / QR' },
          ]}
        />
        {mode === 'barcode' && (
          <Field
            label="Código (leia ou digite)"
            value={manual}
            onChangeText={t => {
              setManual(t);
              setScanned({});
              clearResult();
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        )}
        {mode === 'rfid' && scanned.epc && (
          <>
            <KeyValue k="EPC" v={scanned.epc} />
            {scanned.tid ? <KeyValue k="TID" v={scanned.tid} /> : null}
          </>
        )}
        <Button
          title={mode === 'rfid' ? 'Ler tag' : 'Ler código'}
          icon={mode === 'rfid' ? ScanLine : ScanBarcode}
          variant="secondary"
          onPress={() => read('reader')}
          busy={reading}
          disabled={!connected}
        />
        {mode === 'barcode' && (
          <Button
            title="Ler com a câmera"
            icon={Camera}
            variant="secondary"
            onPress={() => read('camera')}
            disabled={reading}
          />
        )}
        {!connected && (
          <Muted>
            {mode === 'barcode'
              ? 'Leitor desconectado: use a câmera do celular.'
              : 'Conecte o leitor R6 para ler etiquetas RFID.'}
          </Muted>
        )}
        <Button
          title="Pesquisar"
          icon={Search}
          onPress={search}
          busy={busy}
          disabled={!hasQuery}
        />
      </Card>

      {error ? (
        <Card>
          <Text style={[styles.text, { color: color.critical }]}>{error}</Text>
        </Card>
      ) : null}

      {result?.found &&
        result.assets.map(a => (
          <AssetCard key={a.sys_id} asset={a} matchedBy={result.matched_by} />
        ))}

      {result && !result.found && (
        <Card>
          <EmptyState
            icon={PackageSearch}
            title="Ativo não encontrado"
            message={
              result.staging
                ? `Capturado no lote ${result.staging.batch} (${
                    CLASSIFICATION[result.staging.classification] ??
                    result.staging.classification
                  })${
                    result.staging.location
                      ? `, em ${result.staging.location}`
                      : ''
                  }. Ainda não há ativo no ServiceNow.`
                : 'Nada no ServiceNow corresponde a esta leitura.'
            }
          />
        </Card>
      )}
    </Screen>
  );
}

function AssetCard({
  asset,
  matchedBy,
}: {
  asset: LookupAsset;
  matchedBy: string;
}) {
  return (
    <Card
      title={asset.name || asset.asset_tag || 'Ativo'}
      icon={PackageSearch}
      right={
        asset.status ? <Badge text={asset.status} tone="info" /> : undefined
      }
    >
      <Muted>{MATCHED_BY[matchedBy] ?? ''}</Muted>
      <View>
        <KeyValue k="Patrimônio" v={asset.asset_tag} />
        <KeyValue k="Local" v={asset.location_path || asset.location} />
        {asset.stockroom ? (
          <KeyValue k="Almoxarifado" v={asset.stockroom} />
        ) : null}
        <KeyValue k="Modelo" v={asset.model} />
        <KeyValue k="Categoria" v={asset.category} />
        <KeyValue k="Série" v={asset.serial_number} />
        <KeyValue k="Responsável" v={asset.assigned_to} />
        <KeyValue k="Tabela" v={asset.class} />
      </View>
    </Card>
  );
}
