import { stampContext, tagToItem } from '../src/state/AppState';
import {
  buildTree,
  childrenOf,
  isCaptureTarget,
  mergeStructure,
  pathTo,
} from '../src/structure/tree';
import type { LocationNode, Structure } from '../src/types';

const node = (
  sys_id: string,
  name: string,
  type: string,
  parent: string,
  active = true,
): LocationNode => ({
  sys_id,
  name,
  type,
  parent,
  full_name: name,
  active,
});

const structure: Structure = {
  root: 'site',
  serverTime: '2026-09-27T12:00:00Z',
  syncedAt: '',
  locations: [
    node('site', 'UG 100001 – Brasília', 'site', ''),
    node('bA', 'Bloco A', 'building/structure', 'site'),
    node('f1', '1º andar', 'floor', 'bA'),
    node('r10', 'Sala 10', 'room', 'f1'),
    node('r2', 'Sala 2', 'room', 'f1'),
    node('old', 'Sala desativada', 'room', 'f1', false),
    node('orphan', 'Fora da raiz', 'room', 'elsewhere'),
  ],
};

describe('location tree', () => {
  const tree = buildTree(structure);

  it('sorts children naturally and hides inactive nodes', () => {
    expect(childrenOf(tree, 'f1').map(n => n.name)).toEqual([
      'Sala 2',
      'Sala 10',
    ]);
  });

  it('builds the path from the root', () => {
    expect(pathTo(tree, 'r10').map(n => n.name)).toEqual([
      'UG 100001 – Brasília',
      'Bloco A',
      '1º andar',
      'Sala 10',
    ]);
    expect(pathTo(tree, 'orphan')).toEqual([]);
  });

  it('only allows capture on rooms or leaves', () => {
    expect(isCaptureTarget(tree, tree.byId.get('r10')!)).toBe(true);
    expect(isCaptureTarget(tree, tree.byId.get('f1')!)).toBe(false);
  });

  it('merges incremental syncs and replaces on full sync', () => {
    const delta: Structure = {
      root: 'site',
      serverTime: '2026-09-28T12:00:00Z',
      syncedAt: '',
      locations: [
        node('r2', 'Sala 2 (reformada)', 'room', 'f1'),
        node('r3', 'Sala 3', 'room', 'f1'),
      ],
    };
    const merged = mergeStructure(structure, delta, false);
    expect(merged.locations).toHaveLength(8);
    expect(merged.locations.find(l => l.sys_id === 'r2')!.name).toBe(
      'Sala 2 (reformada)',
    );
    expect(merged.serverTime).toBe('2026-09-28T12:00:00Z');
    expect(mergeStructure(structure, delta, true).locations).toHaveLength(2);
  });
});

describe('capture context', () => {
  const tag = tagToItem({
    epc: 'AAAA',
    tid: '',
    user: '',
    pc: '3400',
    rssi: '-40,0',
    antenna: '',
    count: 1,
    timestamp: 1,
  });

  it('stamps the selected room and asset type on new items', () => {
    const [item] = stampContext([tag], {
      location: 'r10',
      locationPath: [],
      assetType: 'chair',
    });
    expect(item.location).toBe('r10');
    expect(item.assetType).toBe('chair');
  });

  it('keeps items unclassified when no type was chosen and leaves explicit values alone', () => {
    expect(
      stampContext([tag], { location: 'r10', locationPath: [] })[0].assetType,
    ).toBeUndefined();
    expect(
      stampContext([{ ...tag, location: 'r2' }], {
        location: 'r10',
        locationPath: [],
      })[0].location,
    ).toBe('r2');
    expect(stampContext([tag], null)[0].location).toBeUndefined();
  });
});
