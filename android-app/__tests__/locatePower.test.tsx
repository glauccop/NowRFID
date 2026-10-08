import React from 'react';
import { DeviceEventEmitter, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import Native from '../specs/NativeChainwayRfid';
import { beepFor, presetFor } from '../src/reader/proximity';
import { serviceNow } from '../src/network/serviceNow';
import { LookupScreen } from '../src/screens/LookupScreen';
import { AppStateProvider, useApp } from '../src/state/AppState';
import { store } from '../src/storage/store';
import { DEFAULT_SETTINGS } from '../src/types';

const flush = () => new Promise<void>(resolve => setImmediate(resolve));
const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function textOf(tree: ReactTestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map(t => [].concat(t.props.children).join(''))
    .join('|');
}

const byTitle = (tree: ReactTestRenderer.ReactTestRenderer, title: string) =>
  tree.root
    .findAll(n => n.props.title === title)
    .find(n => typeof n.props.onPress === 'function')!;

test('beep gets faster and higher as the tag gets closer; silent when not seen', () => {
  expect(beepFor(0)).toBeNull();
  const far = beepFor(10)!;
  const near = beepFor(90)!;
  expect(near.intervalMs).toBeLessThan(far.intervalMs);
  expect(near.frequency).toBeGreaterThan(far.frequency);
  expect(presetFor(10)).toBe('short');
  expect(presetFor(30)).toBe('long');
  expect(presetFor(17)).toBeNull();
});

test('the saved read power is re-applied to the R6 when it connects', async () => {
  await store.saveSettings({ ...DEFAULT_SETTINGS, readPower: 10 });
  let api: ReturnType<typeof useApp> | undefined;
  function Probe() {
    api = useApp();
    return null;
  }
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <AppStateProvider>
        <Probe />
      </AppStateProvider>,
    );
    await flush();
  });
  expect(api!.settings.readPower).toBe(10);
  (Native.setPower as jest.Mock).mockClear();
  await ReactTestRenderer.act(async () => {
    DeviceEventEmitter.emit('ChainwayRfid.connection', {
      status: 'connected',
      address: 'AA:BB',
    });
    await wait(1200);
  });
  expect(Native.setPower).toHaveBeenCalledWith(10);

  // Changing it while connected applies right away and is saved.
  await ReactTestRenderer.act(async () => {
    await api!.setReadPower(20);
  });
  expect(Native.setPower).toHaveBeenLastCalledWith(20);
  expect(api!.settings.readPower).toBe(20);
  expect(api!.readerInfo.power).toBe(20);
  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});

test('Consultar by asset number → Localizar → beeps with the proximity reported by the R6', async () => {
  jest.spyOn(serviceNow, 'lookupAsset').mockResolvedValue({
    status: 200,
    data: {
      found: true,
      matched_by: 'asset_tag',
      staging: null,
      assets: [
        {
          sys_id: '1',
          asset_tag: '323498',
          name: 'Notebook',
          class: 'alm_hardware',
          model: 'NB',
          category: 'Computador',
          serial_number: '',
          status: 'Em uso',
          location: 'Sala 101',
          location_path: 'UG/Sala 101',
          stockroom: '',
          assigned_to: '',
          epc: 'E2004000780600801570752E',
        },
      ],
    },
  });
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <AppStateProvider>
        <LookupScreen />
      </AppStateProvider>,
    );
    await flush();
  });
  const segment = tree!.root
    .findAll(n => typeof n.props.onPress === 'function')
    .find(n =>
      n
        .findAllByType(Text)
        .some(t => String(t.props.children) === 'Código de barras / QR'),
    )!;
  await ReactTestRenderer.act(async () => {
    segment.props.onPress();
    await flush();
  });
  const field = tree!.root.find(
    n =>
      n.props.accessibilityLabel ===
        'Código ou número do patrimônio (leia ou digite)' &&
      typeof n.props.onChangeText === 'function',
  );
  await ReactTestRenderer.act(async () => {
    field.props.onChangeText('323498');
    await flush();
  });
  await ReactTestRenderer.act(async () => {
    byTitle(tree!, 'Pesquisar').props.onPress();
    await flush();
  });
  expect(textOf(tree!)).toContain('E2004000780600801570752E');
  await ReactTestRenderer.act(async () => {
    byTitle(tree!, 'Localizar').props.onPress();
    await flush();
  });
  await ReactTestRenderer.act(async () => {
    byTitle(tree!, 'Iniciar busca').props.onPress();
    await flush();
  });
  expect(Native.startLocate).toHaveBeenCalledWith('E2004000780600801570752E');
  (Native.playTone as jest.Mock).mockClear();
  await ReactTestRenderer.act(async () => {
    DeviceEventEmitter.emit('ChainwayRfid.locate', { value: 85, valid: true });
    await flush();
  });
  // Next beeper tick (≤ 250 ms) picks up the new proximity.
  await ReactTestRenderer.act(async () => {
    await wait(400);
  });
  expect(textOf(tree!)).toContain('Muito perto');
  expect(Native.playTone).toHaveBeenCalled();
  const [frequency] = (Native.playTone as jest.Mock).mock.calls[0];
  expect(frequency).toBeGreaterThan(1500);
  await ReactTestRenderer.act(async () => {
    byTitle(tree!, 'Parar busca').props.onPress();
    await flush();
  });
  expect(Native.stopLocate).toHaveBeenCalled();
  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});
