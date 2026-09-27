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
import {
  Badge,
  Button,
  Card,
  colors,
  Muted,
  Screen,
  styles,
} from '../ui/components';

const CLASSIFY_LATER = '';

/** Operator picks site › building › floor › room and the asset type, then starts the scanner. */
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
  const [cursor, setCursor] = useState(
    captureContext?.location ?? structure?.root ?? '',
  );
  const [assetType, setAssetType] = useState(
    captureContext?.assetType ?? CLASSIFY_LATER,
  );
  const [syncing, setSyncing] = useState(false);

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
    } catch (e) {
      Alert.alert('Sincronizar', e instanceof Error ? e.message : String(e));
    } finally {
      setSyncing(false);
    }
  };

  const path = pathTo(tree, cursor);
  const current = path[path.length - 1];
  const kids = current ? childrenOf(tree, current.sys_id) : [];
  const canStart = !!current && isCaptureTarget(tree, current);

  const start = () => {
    if (!current) {
      return;
    }
    setCaptureContext({
      location: current.sys_id,
      locationPath: path.map(n => n.name),
      assetType: assetType || undefined,
    });
    onStart();
  };

  return (
    <Screen>
      <Card
        title="Estrutura"
        right={
          <Button
            title={structure ? 'Atualizar' : 'Sincronizar'}
            variant="secondary"
            busy={syncing}
            onPress={() => sync(!structure)}
          />
        }
      >
        {structure ? (
          <Muted>
            {tree.byId.size} locais · {assetTypes.length} tipos de bem ·
            sincronizado em {new Date(structure.syncedAt).toLocaleString()}
          </Muted>
        ) : (
          <Muted>
            Conecte-se ao Wi-Fi e sincronize para baixar os locais e os tipos de
            bem. Depois disso o app funciona offline.
          </Muted>
        )}
      </Card>

      {structure && (
        <Card title="1. Local">
          <View style={styles.wrap}>
            {path.map((node, i) => (
              <Pressable
                key={node.sys_id}
                onPress={() => setCursor(node.sys_id)}
              >
                <Text style={[s.crumb, i === path.length - 1 && s.crumbActive]}>
                  {i > 0 ? '› ' : ''}
                  {node.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {current && (
            <Muted>
              {typeLabel(current.type)}
              {canStart ? ' — pronto para registrar aqui' : ' — escolha abaixo'}
            </Muted>
          )}
          {kids.map(node => (
            <Pressable
              key={node.sys_id}
              onPress={() => setCursor(node.sys_id)}
              style={({ pressed }) => [s.row, pressed && s.pressed]}
            >
              <Text style={styles.text}>{node.name}</Text>
              <Badge text={typeLabel(node.type)} color={colors.muted} />
            </Pressable>
          ))}
        </Card>
      )}

      {structure && (
        <Card title="2. Tipo de bem">
          <View style={s.grid}>
            {[
              {
                sys_id: CLASSIFY_LATER,
                name: 'Classificar depois',
                icon: '❔',
                order: 0,
              },
              ...assetTypes,
            ].map(t => (
              <Pressable
                key={t.sys_id || 'later'}
                onPress={() => setAssetType(t.sys_id)}
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

      {structure && (
        <Button
          title="Iniciar scanner"
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: { opacity: 0.6 },
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
