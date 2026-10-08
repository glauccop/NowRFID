import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import { reader } from './chainway';

export const POWER_MIN = 5;
export const POWER_MAX = 30;

export type PowerPreset = 'short' | 'medium' | 'long';

/** Read range presets; distances are rough (they depend on the tag and on what is around it). */
export const POWER_PRESETS: {
  value: PowerPreset;
  label: string;
  dbm: number;
  hint: string;
}[] = [
  {
    value: 'short',
    label: 'Curto',
    dbm: 10,
    hint: 'Cerca de 1 m: só o que está à sua frente. Bom para salas vizinhas e para o fim da busca.',
  },
  {
    value: 'medium',
    label: 'Médio',
    dbm: 20,
    hint: 'Alguns metros: um cômodo pequeno sem pegar o do lado na maioria dos casos.',
  },
  {
    value: 'long',
    label: 'Longo',
    dbm: 30,
    hint: 'Alcance máximo: salas grandes e almoxarifados. Pode ler tags do cômodo ao lado.',
  },
];

/** Preset matching a dBm value exactly, or null for a custom value. */
export function presetFor(dbm: number): PowerPreset | null {
  return POWER_PRESETS.find(p => p.dbm === dbm)?.value ?? null;
}

export function clampPower(dbm: number): number {
  return Math.max(POWER_MIN, Math.min(POWER_MAX, Math.round(dbm)));
}

/** Readings older than this mean the tag went out of range: the beeper goes quiet. */
export const LOCATE_STALE_MS = 1500;

/**
 * Proximity 1–100 -> beep cadence and pitch: far = slow and low (~1.2 s, 600 Hz),
 * close = fast and high (~0.1 s, 2 kHz). 0 = tag not seen, no beep.
 */
export function beepFor(
  value: number,
): { intervalMs: number; frequency: number } | null {
  if (!(value > 0)) {
    return null;
  }
  const v = Math.min(100, value);
  return {
    intervalMs: Math.round(1200 - v * 11),
    frequency: Math.round(600 + v * 14),
  };
}

const BEEP_MS = 60;

/**
 * Beeps on the phone speaker while `active`, faster and higher as `value` grows.
 * `value` is read through a ref so the cadence follows each new reading without restarting.
 */
export function useProximityBeeper(
  active: boolean,
  value: number,
  options: { sound: boolean; vibrate: boolean },
) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!active) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const tick = () => {
      if (stopped) {
        return;
      }
      const beep = beepFor(valueRef.current);
      if (beep) {
        if (optionsRef.current.sound) {
          reader.playTone(beep.frequency, BEEP_MS);
        }
        if (optionsRef.current.vibrate && valueRef.current >= 70) {
          Vibration.vibrate(BEEP_MS);
        }
      }
      timer = setTimeout(tick, beep ? beep.intervalMs : 250);
    };
    tick();
    return () => {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [active]);
}
