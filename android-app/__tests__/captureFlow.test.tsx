import React from 'react';
import { DeviceEventEmitter, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { ScanScreen } from '../src/screens/ScanScreen';
import { AppStateProvider } from '../src/state/AppState';
import { store } from '../src/storage/store';
import { DEFAULT_SETTINGS } from '../src/types';

const flush = () => new Promise<void>(resolve => setImmediate(resolve));

const loc = (sys_id: string, name: string, type: string, parent: string) => ({
  sys_id,
  name,
  type,
  parent,
  full_name: name,
  active: true,
});

const responses: Record<string, unknown> = {
  '/structure': {
    result: {
      root: 'site',
      server_time: '2026-09-27T12:00:00Z',
      locations: [
        loc('site', 'UG 100001', 'site', ''),
        loc('bA', 'Bloco A', 'building/structure', 'site'),
        loc('f1', '1º andar', 'floor', 'bA'),
        loc('r101', 'Sala 101', 'room', 'f1'),
      ],
      stockrooms: [
        {
          sys_id: 'amx',
          name: 'ALMOXARIFADO CENTRAL - AMXCENT',
          location: 'site',
          location_name: 'UG 100001',
        },
      ],
    },
  },
  '/asset-types': {
    result: {
      types: [
        {
          sys_id: 'chair',
          name: 'Cadeira',
          icon: '🪑',
          order: 10,
          siaf: 'siaf303',
          default_model: 'm1',
          models: [
            {
              sys_id: 'm1',
              name: 'CADEIRA GIRATORIA',
              siaf: 'siaf303',
              assets: 9,
            },
          ],
          siaf_codes: [
            {
              sys_id: 'siaf303',
              code: '123110303',
              description: 'MOBILIARIO EM GERAL',
              life_years: 10,
              residual_pct: 10,
            },
          ],
        },
      ],
    },
  },
};

beforeEach(() => {
  (globalThis as unknown as { fetch: unknown }).fetch = jest.fn(
    async (url: string) => {
      const key = Object.keys(responses).find(k => url.includes(k))!;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(responses[key]),
      };
    },
  );
});

function textOf(tree: ReactTestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map(t => [].concat(t.props.children).join(''))
    .join('\n');
}

async function press(tree: ReactTestRenderer.ReactTestRenderer, label: string) {
  const target = tree.root.find(
    n =>
      typeof n.props.onPress === 'function' &&
      n
        .findAllByType(Text)
        .some(t => [].concat(t.props.children).join('').includes(label)),
  );
  await ReactTestRenderer.act(async () => {
    target.props.onPress();
    await flush();
  });
}

test('sync → pick room and type → start scanner → reads land in that room', async () => {
  await store.saveSettings({
    ...DEFAULT_SETTINGS,
    instanceUrl: 'https://example.service-now.com',
    username: 'u',
    password: 'p',
  });
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <AppStateProvider>
        <ScanScreen />
      </AppStateProvider>,
    );
    await flush();
  });

  await press(tree!, 'Sincronizar');
  expect(textOf(tree!)).toContain(
    '4 locais · 1 almoxarifados · 1 tipos de bem',
  );

  await press(tree!, 'Bloco A');
  await press(tree!, '1º andar');
  await press(tree!, 'Sala 101');
  await press(tree!, 'Cadeira');
  await press(tree!, 'Iniciar scanner');

  let text = textOf(tree!);
  expect(text).toContain('Bloco A › 1º andar › Sala 101');
  expect(text).toContain('🪑 Cadeira');

  await ReactTestRenderer.act(async () => {
    DeviceEventEmitter.emit('ChainwayRfid.tags', [
      {
        epc: 'E2801160600002',
        tid: '',
        user: '',
        pc: '3000',
        rssi: '-50',
        antenna: '',
        count: 1,
        timestamp: 1,
      },
    ]);
    await flush();
  });
  text = textOf(tree!);
  expect(text).toContain('E2801160600002');
  expect(text).toContain('1 etiqueta · 0 códigos · 1 leituras');
  expect(text).toContain('🪑 Cadeira · Sala 101');

  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});

test('almoxarifado + plaqueta: barcode then tag pairs the patrimônio, stockroom stamped', async () => {
  const Native = require('../specs/NativeChainwayRfid').default;
  await store.saveSettings({
    ...DEFAULT_SETTINGS,
    instanceUrl: 'https://example.service-now.com',
    username: 'u',
    password: 'p',
  });
  await store.saveCaptureContext(null);
  await store.saveBatch({
    id: 'b2',
    createdAt: '2026-09-30T12:00:00Z',
    notes: '',
    items: [],
    status: 'open',
  });
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <AppStateProvider>
        <ScanScreen />
      </AppStateProvider>,
    );
    await flush();
  });
  // The first test left the structure cached, so the button reads "Atualizar".
  await press(tree!, 'Atualizar');
  await press(tree!, 'Almoxarifado (estoque)');
  await press(tree!, 'AMXCENT');
  await press(tree!, 'Cadeira');
  expect(textOf(tree!)).toContain(
    '123110303 · MOBILIARIO EM GERAL · 10 anos · residual 10%',
  );
  await press(tree!, 'Já tem plaqueta');
  await press(tree!, 'Iniciar scanner');
  expect(textOf(tree!)).toContain(
    'Vincular: leia o código de barras da plaqueta',
  );

  // A tag before the plaqueta is ignored.
  const emitTag = async (epc: string) =>
    ReactTestRenderer.act(async () => {
      DeviceEventEmitter.emit('ChainwayRfid.tags', [
        {
          epc,
          tid: '',
          user: '',
          pc: '3000',
          rssi: '-50',
          antenna: '',
          count: 1,
          timestamp: 1,
        },
      ]);
      await flush();
    });
  await emitTag('E200AAAA');
  expect(textOf(tree!)).not.toContain('E200AAAA');

  // Reader disconnected in tests: the plaqueta comes from the phone camera.
  Native.scanCameraCode.mockResolvedValueOnce({
    value: '049567',
    symbology: 'CODE_128',
    source: 'camera',
  });
  await press(tree!, 'Ler com a câmera');
  expect(Native.scanCameraCode).toHaveBeenCalledTimes(1);
  expect(textOf(tree!)).toContain('Plaqueta 049567 lida');

  await emitTag('E200BBBB');
  const text = textOf(tree!);
  expect(text).toContain('E200BBBB');
  expect(text).toContain('Patrimônio 049567');
  expect(text).toContain('Almoxarifado ALMOXARIFADO CENTRAL - AMXCENT');

  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});
