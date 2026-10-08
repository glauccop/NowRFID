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

test('barcode mode: the phone camera fills the code and Pesquisar uses it', async () => {
  (Native.scanCameraCode as jest.Mock).mockResolvedValue({
    value: '049567',
    symbology: 'CODE_128',
    source: 'camera',
  });
  const spy = jest.spyOn(serviceNow, 'lookupAsset').mockResolvedValue({
    status: 200,
    data: { found: false, matched_by: '', assets: [], staging: null },
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
  const byTitle = (title: string) =>
    tree!.root
      .findAll(n => n.props.title === title || n.props.label === title)
      .find(n => typeof n.props.onPress === 'function')!;
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
  await ReactTestRenderer.act(async () => {
    byTitle('Ler com a câmera').props.onPress();
    await flush();
  });
  await ReactTestRenderer.act(async () => {
    byTitle('Pesquisar').props.onPress();
    await flush();
  });
  expect(spy).toHaveBeenCalledWith(expect.anything(), { barcode: '049567' });
  expect(
    tree!.root
      .findAllByType(Text)
      .map(n => String(n.props.children))
      .join('|'),
  ).toContain('Ativo não encontrado');
});
