import React from 'react';
import { DeviceEventEmitter, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import Native from '../specs/NativeChainwayRfid';
import { LookupScreen } from '../src/screens/LookupScreen';
import { serviceNow } from '../src/network/serviceNow';
import { AppStateProvider } from '../src/state/AppState';

const flush = () => new Promise<void>(resolve => setImmediate(resolve));

test('scan a tag, press Pesquisar and show where the asset is registered', async () => {
  (Native.inventorySingle as jest.Mock).mockResolvedValue({
    epc: 'E2004000780600801570752E',
    tid: '',
    rssi: '-50',
    count: 1,
  });
  const spy = jest.spyOn(serviceNow, 'lookupAsset').mockResolvedValue({
    status: 200,
    data: {
      found: true,
      matched_by: 'tag_epc',
      staging: null,
      assets: [
        {
          sys_id: '1',
          asset_tag: '323498',
          name: 'Mesa de reunião',
          class: 'sn_ent_facility_asset',
          model: 'MESA',
          category: 'Mobiliário',
          serial_number: '',
          status: 'Em uso',
          location: 'Sala 101',
          location_path: 'Brasil/DF/Brasília/UG/Sala 101',
          stockroom: '',
          assigned_to: '',
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
  await ReactTestRenderer.act(async () => {
    DeviceEventEmitter.emit('ChainwayRfid.trigger', {
      action: 'down',
      keyCode: 1,
    });
    await flush();
  });
  const search = tree!.root
    .findAll(n => n.props.title === 'Pesquisar')
    .find(n => typeof n.props.onPress === 'function')!;
  await ReactTestRenderer.act(async () => {
    search.props.onPress();
    await flush();
  });
  expect(spy).toHaveBeenCalledWith(expect.anything(), {
    epc: 'E2004000780600801570752E',
    tid: undefined,
  });
  const text = tree!.root
    .findAllByType(Text)
    .map(n => String(n.props.children))
    .join('|');
  expect(text).toContain('323498');
  expect(text).toContain('Brasil/DF/Brasília/UG/Sala 101');
});
