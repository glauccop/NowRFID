import React from 'react';
import { DeviceEventEmitter, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import Native from '../specs/NativeChainwayRfid';
import { ScannerView } from '../src/screens/ScanScreen';
import { AppStateProvider } from '../src/state/AppState';

const flush = () => new Promise<void>(resolve => setImmediate(resolve));

const fieldTag = (epc: string) => ({
  timestamp: 1790471682119,
  antenna: '',
  pc: '3400',
  rssi: '-44,10',
  count: 1,
  epc,
  user: '',
  tid: '',
});

// Regression: in the first field test continuous inventory stopped ~150 ms after the first
// tags arrived, because the tag-listener effect re-ran and its cleanup called stopInventory.
test('continuous inventory keeps running while tags arrive', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <AppStateProvider>
        <ScannerView onChangeSelection={() => undefined} />
      </AppStateProvider>,
    );
    await flush();
  });

  await ReactTestRenderer.act(async () => {
    DeviceEventEmitter.emit('ChainwayRfid.trigger', {
      action: 'down',
      keyCode: 1,
    });
    await flush();
  });
  expect(Native.startInventory).toHaveBeenCalledTimes(1);

  for (const batch of [
    [
      fieldTag('66C66D4F23D5340B7271F119'),
      fieldTag('EF649B4569317F047271F139'),
    ],
    [
      fieldTag('66C66D4F23D5340B7271F119'),
      fieldTag('A832D5983288D7ED7271F12D'),
    ],
  ]) {
    await ReactTestRenderer.act(async () => {
      DeviceEventEmitter.emit('ChainwayRfid.tags', batch);
      await flush();
    });
  }

  expect(Native.stopInventory).not.toHaveBeenCalled();
  const text = tree!.root
    .findAllByType(Text)
    .map(t => [].concat(t.props.children).join(''))
    .join('\n');
  expect(text).toContain('A832D5983288D7ED7271F12D');
  expect(text).toContain('3 RFID');

  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
  expect(Native.stopInventory).toHaveBeenCalledTimes(1);
});
