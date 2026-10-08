import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  clampPower,
  POWER_MAX,
  POWER_MIN,
  POWER_PRESETS,
  PowerPreset,
  presetFor,
} from '../reader/proximity';
import { useApp } from '../state/AppState';
import { Button, Muted, Segmented, styles } from '../ui/components';
import { useToast } from '../ui/toast';

/**
 * Read range of the R6: presets Curto / Médio / Longo plus a fine −/+ in dBm.
 * The choice is saved in the settings and re-applied every time the reader connects.
 */
export function PowerPicker({ fine = false }: { fine?: boolean }) {
  const { settings, setReadPower, connection } = useApp();
  const toast = useToast();
  const dbm = settings.readPower;
  const preset = presetFor(dbm);
  const connected = connection.status === 'connected';

  const apply = async (value: number) => {
    const next = clampPower(value);
    if (next === dbm) {
      return;
    }
    if (!(await setReadPower(next))) {
      toast(
        'O leitor recusou a potência; ela será aplicada na próxima conexão.',
        'critical',
      );
    }
  };

  const hint =
    POWER_PRESETS.find(p => p.value === preset)?.hint ??
    'Potência personalizada.';

  return (
    <View style={s.picker}>
      <Segmented<PowerPreset | 'custom'>
        value={preset ?? 'custom'}
        onChange={v => {
          const p = POWER_PRESETS.find(x => x.value === v);
          if (p) {
            apply(p.dbm);
          }
        }}
        options={POWER_PRESETS.map(p => ({ value: p.value, label: p.label }))}
      />
      {fine && (
        <View style={styles.row}>
          <Button
            title="−"
            variant="secondary"
            disabled={dbm <= POWER_MIN}
            onPress={() => apply(dbm - 1)}
          />
          <Text style={[styles.cardTitle, s.dbm]}>{dbm} dBm</Text>
          <Button
            title="+"
            variant="secondary"
            disabled={dbm >= POWER_MAX}
            onPress={() => apply(dbm + 1)}
          />
        </View>
      )}
      <Muted>
        {fine ? '' : `${dbm} dBm · `}
        {hint}
        {connected ? '' : ' Será aplicada quando o leitor conectar.'}
      </Muted>
    </View>
  );
}

const s = StyleSheet.create({
  picker: { gap: 8 },
  dbm: { fontSize: 22 },
});
