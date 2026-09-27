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
    },
  },
  '/asset-types': {
    result: {
      types: [{ sys_id: 'chair', name: 'Cadeira', icon: '🪑', order: 10 }],
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
  expect(textOf(tree!)).toContain('4 locais · 1 tipos de bem');

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
  expect(text).toContain('1 RFID · 0 códigos aqui');
  expect(text).toContain('🪑 Cadeira · Sala 101');

  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});
