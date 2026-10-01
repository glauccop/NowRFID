import { mergeItems, tagToItem } from '../src/state/AppState';
import {
  base64,
  generateEpc,
  validateEpc,
  validatePassword,
} from '../src/utils/ids';
import type { ScanItem } from '../src/types';

const tag = (epc: string, count = 1, rssi = '-60') => ({
  epc,
  tid: '',
  user: '',
  pc: '3000',
  rssi,
  antenna: '1',
  count,
  timestamp: 1_700_000_000_000,
});

describe('EPC helpers', () => {
  it('generates a valid 96-bit EPC', () => {
    const epc = generateEpc();
    expect(epc).toHaveLength(24);
    expect(validateEpc(epc)).toBeNull();
  });

  it('rejects non-hex or partial-word EPCs', () => {
    expect(validateEpc('XYZ1')).not.toBeNull();
    expect(validateEpc('ABC')).not.toBeNull();
    expect(validateEpc('')).not.toBeNull();
  });

  it('validates 8-hex access passwords', () => {
    expect(validatePassword('00000000')).toBeNull();
    expect(validatePassword('1234')).not.toBeNull();
    expect(validatePassword('ZZZZZZZZ')).not.toBeNull();
  });
});

describe('base64', () => {
  it('encodes ascii and utf-8 like standard base64', () => {
    const cases: [string, string][] = [
      ['admin:secret', 'YWRtaW46c2VjcmV0'],
      ['usuário:senha çã', 'dXN1w6FyaW86c2VuaGEgw6fDow=='],
      ['a', 'YQ=='],
      ['ab', 'YWI='],
      ['abc', 'YWJj'],
    ];
    for (const [input, expected] of cases) {
      expect(base64(input)).toBe(expected);
    }
  });
});

describe('batch merge', () => {
  it('dedupes repeated RFID reads by EPC and sums read counts', () => {
    let items: ScanItem[] = [];
    items = mergeItems(items, [
      tagToItem(tag('AAAA', 2)),
      tagToItem(tag('BBBB')),
    ]);
    items = mergeItems(items, [tagToItem(tag('AAAA', 3, '-45'))]);
    expect(items).toHaveLength(2);
    const a = items.find(i => i.epc === 'AAAA')!;
    expect(a.readCount).toBe(5);
    expect(a.rssi).toBe('-45.0');
  });

  it('keeps written tags as separate entries from reads of the same EPC', () => {
    const items = mergeItems(
      [tagToItem(tag('AAAA'))],
      [tagToItem(tag('AAAA'), 'write'), tagToItem(tag('AAAA'), 'write')],
    );
    expect(items.filter(i => i.operation === 'write')).toHaveLength(2);
    expect(items.filter(i => i.operation === 'read')).toHaveLength(1);
  });
});

describe('TJDFT data (30/09)', () => {
  const { summarize, mergeItems } = require('../src/state/AppState');
  const { siafFor, describeSiaf } = require('../src/utils/siaf');
  const { buildTree, isCaptureTarget } = require('../src/structure/tree');

  test('SIAF comes from the chosen model, else the type default', () => {
    const type = {
      sys_id: 'mesa',
      name: 'Mesa',
      icon: '',
      order: 0,
      siaf: 's303',
      default_model: 'm1',
      models: [
        { sys_id: 'm1', name: 'MESA RETA', siaf: 's303', assets: 5 },
        { sys_id: 'm2', name: 'MESA DE SOM', siaf: 's405', assets: 1 },
      ],
      siaf_codes: [
        {
          sys_id: 's303',
          code: '123110303',
          description: 'MOBILIARIO EM GERAL',
          life_years: 10,
          residual_pct: 10,
        },
        {
          sys_id: 's405',
          code: '123110405',
          description: 'AUDIO, VIDEO E FOTO',
          life_years: 10,
          residual_pct: 10,
        },
      ],
    };
    expect(siafFor(type)?.code).toBe('123110303');
    expect(siafFor(type, 'm2')?.code).toBe('123110405');
    expect(describeSiaf(undefined)).toBe('Sem conta SIAF');
  });

  test('an entity is never a capture target, its rooms are', () => {
    const tree = buildTree({
      root: 'df',
      serverTime: '',
      syncedAt: '',
      locations: [
        {
          sys_id: 'df',
          name: 'Distrito Federal',
          type: '',
          parent: '',
          full_name: '',
          active: true,
        },
        {
          sys_id: 'tag',
          name: 'Taguatinga',
          type: '',
          parent: 'df',
          full_name: '',
          active: true,
        },
        {
          sys_id: 'ent',
          name: '11302010000 - 1ª VARA CRIMINAL',
          type: '',
          parent: 'tag',
          full_name: '',
          active: true,
          kind: 'entity',
        },
        {
          sys_id: 'sala',
          name: '3001148 - Sala 148',
          type: 'place',
          parent: 'ent',
          full_name: '',
          active: true,
        },
      ],
    });
    expect(isCaptureTarget(tree, tree.byId.get('ent'))).toBe(false);
    expect(isCaptureTarget(tree, tree.byId.get('sala'))).toBe(true);
  });

  test('re-reading a paired tag keeps its patrimônio', () => {
    const base = {
      captureType: 'rfid',
      operation: 'read',
      epc: 'E1',
      readCount: 1,
      capturedAt: '',
      raw: {},
    };
    const merged = mergeItems(
      [{ ...base, id: 'a', assetTag: '049567' }],
      [{ ...base, id: 'b' }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ assetTag: '049567', readCount: 2 });
  });

  test('send summary lists the patrimônios issued by ServiceNow', () => {
    const r = summarize(
      'NRB0001',
      {
        a: { status: 'created', assetTag: '323498', message: '' },
        b: { status: 'existing', message: '' },
        c: { status: 'matched', assetTag: '049567', message: '' },
        d: { status: 'error', message: 'x' },
      },
      1,
    );
    expect(r).toEqual({
      batchNumber: 'NRB0001',
      created: ['323498'],
      existing: 1,
      matched: 1,
      pending: 0,
      failed: 2,
    });
  });
});
