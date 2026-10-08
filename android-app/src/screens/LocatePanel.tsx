import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Radar, Square } from 'lucide-react-native';
import { reader } from '../reader/chainway';
import { LOCATE_STALE_MS, useProximityBeeper } from '../reader/proximity';
import { Button, Muted, styles, Toggle } from '../ui/components';
import { color, font, radius } from '../ui/theme';
import { validateEpc } from '../utils/ids';
import { PowerPicker } from './PowerPicker';

function proximityLabel(value: number): string {
  if (value <= 0) {
    return 'Fora de alcance';
  }
  if (value > 70) {
    return 'Muito perto';
  }
  if (value > 35) {
    return 'Perto';
  }
  return 'Longe';
}

/**
 * Tag finder: the R6 reports how close the tag with `epc` is (0–100) and the phone beeps faster
 * and higher as it gets closer. Used by Consultar (asset number -> EPC) and Ferramentas › Localizar.
 */
export function LocatePanel({
  epc,
  connected,
}: {
  epc: string;
  connected: boolean;
}) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState(0);
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const lastSeen = useRef(0);

  useProximityBeeper(active, value, { sound, vibrate });

  useEffect(() => {
    const sub = reader.onLocate(evt => {
      if (evt.valid) {
        lastSeen.current = Date.now();
        setValue(evt.value);
      }
    });
    return () => {
      sub.remove();
      reader.stopLocate().catch(() => undefined);
    };
  }, []);

  // No reading for a while = the tag went out of range.
  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = setInterval(() => {
      if (Date.now() - lastSeen.current > LOCATE_STALE_MS) {
        setValue(0);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [active]);

  // A different tag (new lookup) stops the current search.
  useEffect(() => {
    setActive(false);
    setValue(0);
    reader.stopLocate().catch(() => undefined);
  }, [epc]);

  const toggle = async () => {
    if (active) {
      await reader.stopLocate().catch(() => undefined);
      setActive(false);
      setValue(0);
      return;
    }
    const problem = validateEpc(epc);
    if (problem) {
      return Alert.alert('Localizar', problem);
    }
    setValue(0);
    lastSeen.current = 0;
    if (await reader.startLocate(epc).catch(() => false)) {
      setActive(true);
    } else {
      Alert.alert('Localizar', 'O leitor não iniciou a localização.');
    }
  };

  const barColor =
    value > 70 ? color.positive : value > 35 ? color.warning : color.primary;

  return (
    <View style={s.panel}>
      <Button
        title={active ? 'Parar busca' : 'Iniciar busca'}
        icon={active ? Square : Radar}
        variant={active ? 'danger' : 'primary'}
        disabled={!connected}
        onPress={toggle}
      />
      {!connected && (
        <Muted>Conecte o leitor R6 para localizar a etiqueta.</Muted>
      )}
      <View style={s.readout}>
        <Text
          accessibilityLiveRegion="polite"
          style={[s.value, { color: barColor }]}
        >
          {value}
        </Text>
        <Text style={[styles.text, { fontFamily: font.bold }]}>
          {active ? proximityLabel(value) : 'Parado'}
        </Text>
      </View>
      <View style={s.track}>
        <View
          style={[s.fill, { width: `${value}%`, backgroundColor: barColor }]}
        />
      </View>
      <Muted>
        Proximidade de 0 a 100. O bipe acelera e fica mais agudo conforme você
        chega perto. Na reta final, use a potência Curto para apontar o
        equipamento exato.
      </Muted>
      <Toggle label="Bipe no celular" value={sound} onChange={setSound} />
      <Toggle
        label="Vibrar quando muito perto"
        value={vibrate}
        onChange={setVibrate}
      />
      <PowerPicker />
    </View>
  );
}

const s = StyleSheet.create({
  panel: { gap: 12 },
  readout: { alignItems: 'center', gap: 4 },
  value: { fontFamily: font.black, fontSize: 40 },
  track: {
    height: 22,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.chip,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
});
