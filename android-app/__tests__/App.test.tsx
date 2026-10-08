import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

const flush = () => new Promise<void>(resolve => setImmediate(resolve));

function texts(tree: ReactTestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map(t => [].concat(t.props.children).join(''))
    .join('\n');
}

async function pressLabel(
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
) {
  const target = tree.root.find(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  );
  await ReactTestRenderer.act(async () => {
    target.props.onPress();
    await flush();
  });
}

test('Horizon shell: four tabs plus gear hub, per-screen title and stacked screens', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
    await flush();
  });

  const tabs = tree!.root.findAll(
    n =>
      n.props.accessibilityRole === 'tab' &&
      typeof n.props.onPress === 'function',
  );
  expect(tabs.map(t => t.props.accessibilityLabel)).toEqual([
    'Escanear',
    'Gravar',
    'Lote',
    'Consultar',
  ]);
  expect(texts(tree!)).toContain('Escanear bens');

  await pressLabel(tree!, 'Lote');
  expect(texts(tree!)).toContain('Lote atual');

  await pressLabel(tree!, 'Leitor: Conectar leitor');
  expect(texts(tree!)).toContain('Leitor RFID');
  expect(
    tree!.root.findAll(n => n.props.accessibilityRole === 'tab'),
  ).toHaveLength(0);

  await pressLabel(tree!, 'Voltar');
  expect(texts(tree!)).toContain('Lote atual');

  // Gear: full-screen hub with stacked Ajustes / Ferramentas buttons, each opening its screen.
  await pressLabel(tree!, 'Ajustes');
  expect(texts(tree!)).toContain('Ajustes e ferramentas');
  expect(
    tree!.root.findAll(n => n.props.accessibilityRole === 'tab'),
  ).toHaveLength(0);
  await pressLabel(tree!, 'Ferramentas');
  expect(texts(tree!)).toContain('Ferramentas de tag');
  await pressLabel(tree!, 'Voltar');
  expect(texts(tree!)).toContain('Ajustes e ferramentas');
  await pressLabel(tree!, 'Ajustes');
  expect(texts(tree!)).toContain('Ajustes');
  await pressLabel(tree!, 'Voltar');
  await pressLabel(tree!, 'Voltar');
  expect(texts(tree!)).toContain('Lote atual');

  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});
