import { History, Inbox, Layers, List, Send } from 'lucide-react-native';
import { useToast } from '../ui/toast';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useApp } from '../state/AppState';
import {
  EmptyState,
  Badge,
  Button,
  Card,
  colors,
  Field,
  KeyValue,
  Screen,
  styles,
} from '../ui/components';
import { ItemRow } from './ItemRow';

export function BatchScreen() {
  const {
    batch,
    history,
    settings,
    removeItem,
    setNotes,
    newBatch,
    sendBatch,
  } = useApp();
  const [showHistory, setShowHistory] = useState(false);
  const [openBatch, setOpenBatch] = useState('');
  const toast = useToast();
  const sending = batch.status === 'sending';
  const reads = batch.items.filter(i => i.operation === 'read').length;
  const writes = batch.items.length - reads;

  const send = async () => {
    if (!settings.instanceUrl) {
      return Alert.alert(
        'Enviar lote',
        'Configure a instância ServiceNow na aba Config.',
      );
    }
    try {
      const r = await sendBatch();
      const lines = [
        r.created.length &&
          `${r.created.length} ativos criados — patrimônio ${r.created.join(
            ', ',
          )}`,
        r.matched && `${r.matched} tags vinculadas a patrimônios existentes`,
        r.existing && `${r.existing} tags já cadastradas (local atualizado)`,
        r.pending && `${r.pending} itens a classificar no ServiceNow`,
        r.failed && `${r.failed} itens com erro (veja no histórico)`,
      ].filter(Boolean);
      if (lines.length) {
        Alert.alert(`Lote ${r.batchNumber} enviado`, lines.join('\n\n'));
      } else {
        toast('Lote enviado ao ServiceNow');
      }
    } catch (e) {
      Alert.alert(
        'Falha no envio',
        `${
          e instanceof Error ? e.message : String(e)
        }\n\nO lote continua salvo no aparelho — tente novamente.`,
      );
    }
  };

  const discard = () =>
    Alert.alert('Descartar lote', 'Remover todos os itens deste lote?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: newBatch },
    ]);

  const statusColor = {
    open: colors.primary,
    sending: colors.warning,
    sent: colors.success,
    error: colors.danger,
  }[batch.status];

  return (
    <Screen>
      <Card
        title="Lote atual"
        icon={Layers}
        right={<Badge text={batch.status.toUpperCase()} color={statusColor} />}
      >
        <KeyValue
          k="Criado em"
          v={new Date(batch.createdAt).toLocaleString()}
        />
        <KeyValue
          k="Itens"
          v={`${batch.items.length} (${reads} lidos · ${writes} gravados)`}
        />
        {batch.lastError && (
          <Text style={{ color: colors.danger }}>
            Último erro: {batch.lastError}
          </Text>
        )}
        <Field
          label="Observações do lote"
          value={batch.notes}
          onChangeText={setNotes}
          multiline
        />
        <View style={styles.wrap}>
          <Button
            title="Enviar ao ServiceNow"
            icon={Send}
            variant="success"
            busy={sending}
            disabled={!batch.items.length}
            onPress={send}
          />
          <Button
            title="Descartar"
            variant="secondary"
            disabled={sending || !batch.items.length}
            onPress={discard}
          />
        </View>
      </Card>

      <Card title="Itens" icon={List}>
        {batch.items.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="Lote vazio"
            message="Os itens escaneados ou gravados aparecem aqui até o envio."
          />
        )}
        {batch.items.map(item => (
          <ItemRow
            key={item.id}
            item={item}
            onRemove={sending ? undefined : () => removeItem(item.id)}
          />
        ))}
      </Card>

      <Card
        title={`Enviados (${history.length})`}
        icon={History}
        right={
          <Button
            title={showHistory ? 'Ocultar' : 'Mostrar'}
            variant="secondary"
            onPress={() => setShowHistory(s => !s)}
          />
        }
      >
        {showHistory &&
          history.map(h => (
            <View key={h.id}>
              <Pressable
                onPress={() => setOpenBatch(id => (id === h.id ? '' : h.id))}
                style={[
                  styles.row,
                  {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 6,
                  },
                ]}
              >
                <View style={styles.flex1}>
                  <Text style={styles.text}>
                    {h.serverNumber || h.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.muted}>
                    {h.sentAt ? new Date(h.sentAt).toLocaleString() : ''}
                  </Text>
                </View>
                <Badge
                  text={`${h.items.length} itens`}
                  color={colors.success}
                />
              </Pressable>
              {openBatch === h.id &&
                h.items.map(item => <ItemRow key={item.id} item={item} />)}
            </View>
          ))}
      </Card>
    </Screen>
  );
}
