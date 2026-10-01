import {
  Boxes,
  Database,
  MapPin,
  RefreshCw,
  ScanLine,
  Shapes,
  Tags,
} from 'lucide-react-native';
import { useToast } from '../ui/toast';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../state/AppState';
import {
  buildTree,
  childrenOf,
  isCaptureTarget,
  pathTo,
  typeLabel,
} from '../structure/tree';
import type { CaptureMode } from '../types';
import {
  Badge,
  Button,
  Card,
  colors,
  Field,
  Muted,
  Screen,
  Segmented,
  styles,
} from '../ui/components';
import { describeSiaf, siafFor } from '../utils/siaf';

const CLASSIFY_LATER = '';
const DEFAULT_MODEL = '';
const MODELS_SHOWN = 8;

type Destination = 'room' | 'stockroom';

/**
 * Operator picks where the goods are (a room under an entity, or an almoxarifado), the asset type
 * and model, and whether the goods are new or already carry a plaqueta; then starts the scanner.
 */
export function PrepareCapture({ onStart }: { onStart: () => void }) {
  const {
    settings,
    structure,
    assetTypes,
    captureContext,
    syncStructure,
    setCaptureContext,
  } = useApp();
  const tree = useMemo(() => buildTree(structure), [structure]);
  const stockrooms = structure?.stockrooms ?? [];
  const [destination, setDestination] = useState<Destination>(
    captureContext?.stockroom ? 'stockroom' : 'room',
  );
  const [cursor, setCursor] = useState(
    captureContext && !captureContext.stockroom
      ? captureContext.location
      : structure?.root ?? '',
  );
  const [stockroom, setStockroom] = useState(captureContext?.stockroom ?? '');
  const [assetType, setAssetType] = useState(
    captureContext?.assetType ?? CLASSIFY_LATER,
  );
  const [model, setModel] = useState(captureContext?.model ?? DEFAULT_MODEL);
  const [modelFilter, setModelFilter] = useState('');
  const [mode, setMode] = useState<CaptureMode>(captureContext?.mode ?? 'new');
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!tree.byId.has(cursor) && tree.root) {
      setCursor(tree.root.sys_id);
    }
  }, [tree, cursor]);

  const sync = async (full = false) => {
    if (!settings.instanceUrl) {
      Alert.alert(
        'Sincronizar',
        'Configure a instância ServiceNow na aba Config.',
      );
      return;
    }
    setSyncing(true);
    try {
      await syncStructure(full);
      toast('Estrutura sincronizada');
    } catch (e) {
      Alert.alert('Sincronizar', e instanceof Error ? e.message : String(e));
    } finally {
      setSyncing(false);
    }
  };

  const path = pathTo(tree, cursor);
  const current = path[path.length - 1];
  const kids = current ? childrenOf(tree, current.sys_id) : [];
  const room = !!current && isCaptureTarget(tree, current);
  const store = stockrooms.find(r => r.sys_id === stockroom);
  const canStart = destination === 'room' ? room : !!store;

  const type = assetTypes.find(t => t.sys_id === assetType);
  const models = type?.models ?? [];
  const filtered = modelFilter
    ? models.filter(m =>
        m.name.toLowerCase().includes(modelFilter.trim().toLowerCase()),
      )
    : models;
  const siaf = siafFor(type, model);

  const chooseType = (id: string) => {
    setAssetType(id);
    setModel(DEFAULT_MODEL);
    setModelFilter('');
  };

  const start = () => {
    if (destination === 'room' && current) {
      setCaptureContext({
        location: current.sys_id,
        locationPath: path.map(n => n.name),
        assetType: assetType || undefined,
        model: model || undefined,
        mode,
      });
    } else if (store) {
      setCaptureContext({
        location: store.location,
        locationPath: ['Almoxarifado', store.name],
        stockroom: store.sys_id,
        assetType: assetType || undefined,
        model: model || undefined,
        mode,
      });
    } else {
      return;
    }
    onStart();
  };

  return (
    <Screen>
      <Card
        title="Estrutura"
        icon={Database}
        right={
          <Button
            title={structure ? 'Atualizar' : 'Sincronizar'}
            icon={RefreshCw}
            variant="secondary"
            busy={syncing}
            onPress={() => sync(!structure)}
          />
        }
      >
        {structure ? (
          <Muted>
            {tree.byId.size} locais · {stockrooms.length} almoxarifados ·{' '}
            {assetTypes.length} tipos de bem · sincronizado em{' '}
            {new Date(structure.syncedAt).toLocaleString()}
          </Muted>
        ) : (
          <Muted>
            Conecte-se ao Wi-Fi e sincronize para baixar os locais, os
            almoxarifados e os tipos de bem. Depois disso o app funciona
            offline.
          </Muted>
        )}
      </Card>

      {structure && (
        <Card title="1. Destino" icon={MapPin}>
          <Segmented
            value={destination}
            onChange={setDestination}
            options={[
              { value: 'room', label: 'Sala (em uso)' },
              { value: 'stockroom', label: 'Almoxarifado (estoque)' },
            ]}
          />
          {destination === 'room' ? (
            <>
              <View style={styles.wrap}>
                {path.map((node, i) => (
                  <Pressable
                    key={node.sys_id}
                    onPress={() => setCursor(node.sys_id)}
                  >
                    <Text
                      style={[s.crumb, i === path.length - 1 && s.crumbActive]}
                    >
                      {i > 0 ? '› ' : ''}
                      {node.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {current && (
                <Muted>
                  {typeLabel(current.type, current.kind)}
                  {room ? ' — pronto para registrar aqui' : ' — escolha abaixo'}
                </Muted>
              )}
              {kids.map(node => (
                <Pressable
                  key={node.sys_id}
                  onPress={() => setCursor(node.sys_id)}
                  style={({ pressed }) => [s.row, pressed && s.pressed]}
                >
                  <Text style={[styles.text, s.rowText]}>{node.name}</Text>
                  <Badge
                    text={typeLabel(node.type, node.kind)}
                    color={colors.muted}
                  />
                </Pressable>
              ))}
            </>
          ) : (
            <>
              {stockrooms.length === 0 && (
                <Muted>Nenhum almoxarifado sincronizado.</Muted>
              )}
              {stockrooms.map(r => (
                <Pressable
                  key={r.sys_id}
                  onPress={() => setStockroom(r.sys_id)}
                  style={({ pressed }) => [
                    s.row,
                    r.sys_id === stockroom && s.rowActive,
                    pressed && s.pressed,
                  ]}
                >
                  <View style={s.rowText}>
                    <Text style={styles.text}>{r.name}</Text>
                    {!!r.location_name && <Muted>{r.location_name}</Muted>}
                  </View>
                  {r.sys_id === stockroom && (
                    <Badge text="Selecionado" color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </>
          )}
        </Card>
      )}

      {structure && (
        <Card title="2. Tipo de bem" icon={Shapes}>
          <View style={s.grid}>
            {[
              {
                sys_id: CLASSIFY_LATER,
                name: 'Classificar depois',
                icon: '❔',
              },
              ...assetTypes,
            ].map(t => (
              <Pressable
                key={t.sys_id || 'later'}
                onPress={() => chooseType(t.sys_id)}
                style={[s.tile, assetType === t.sys_id && s.tileActive]}
              >
                <Text style={s.tileIcon}>{t.icon || '📦'}</Text>
                <Text
                  style={[
                    s.tileText,
                    assetType === t.sys_id && s.tileTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {t.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      {structure && type && (
        <Card title="Modelo e conta SIAF" icon={Boxes}>
          <Text style={s.siaf}>{describeSiaf(siaf)}</Text>
          {models.length > MODELS_SHOWN && (
            <Field
              label="Filtrar modelos"
              value={modelFilter}
              onChangeText={setModelFilter}
              placeholder="Ex.: Fujitsu, giratória…"
            />
          )}
          {[
            {
              sys_id: DEFAULT_MODEL,
              name: 'Modelo padrão (o mais usado)',
              assets: 0,
            },
            ...filtered.slice(0, MODELS_SHOWN),
          ].map(m => (
            <Pressable
              key={m.sys_id || 'default'}
              onPress={() => setModel(m.sys_id)}
              style={({ pressed }) => [
                s.row,
                m.sys_id === model && s.rowActive,
                pressed && s.pressed,
              ]}
            >
              <Text style={[styles.text, s.rowText]} numberOfLines={2}>
                {m.name}
              </Text>
              {m.assets > 0 && (
                <Badge text={`${m.assets} ativos`} color={colors.muted} />
              )}
            </Pressable>
          ))}
          {filtered.length > MODELS_SHOWN && (
            <Muted>
              +{filtered.length - MODELS_SHOWN} modelos — use o filtro.
            </Muted>
          )}
        </Card>
      )}

      {structure && (
        <Card title="3. Patrimônio" icon={Tags}>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'new', label: 'Bem novo' },
              { value: 'existing', label: 'Já tem plaqueta' },
            ]}
          />
          <Muted>
            {mode === 'new'
              ? 'O ServiceNow gera o número de patrimônio ao criar o ativo; o app mostra o número depois do envio.'
              : 'Leia o código de barras da plaqueta e, em seguida, a tag RFID do bem: o app vincula a tag ao patrimônio existente.'}
          </Muted>
        </Card>
      )}

      {structure && (
        <Button
          title="Iniciar scanner"
          icon={ScanLine}
          variant="success"
          disabled={!canStart}
          onPress={start}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  crumb: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  crumbActive: { color: colors.text, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowText: { flex: 1 },
  rowActive: { backgroundColor: '#E8F0FE' },
  pressed: { opacity: 0.6 },
  siaf: { fontSize: 13, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '31%',
    minHeight: 78,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  tileActive: { borderColor: colors.primary, backgroundColor: '#E8F0FE' },
  tileIcon: { fontSize: 26 },
  tileText: { fontSize: 12, color: colors.text, textAlign: 'center' },
  tileTextActive: { color: colors.primary, fontWeight: '700' },
});
