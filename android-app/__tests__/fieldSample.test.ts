// Values taken from the first field test with the R6 (amostras.txt, 2026-09-27).
import { barcodeToItem, tagToItem } from '../src/state/AppState';
import { inferSymbology, normalizeRssi } from '../src/utils/codes';

describe('field sample normalisation', () => {
  it('converts pt-BR locale RSSI to a dotted number', () => {
    expect(normalizeRssi('-44,10')).toBe('-44.1');
    expect(normalizeRssi('-39.70')).toBe('-39.7');
    expect(normalizeRssi('')).toBeUndefined();
    expect(normalizeRssi('n/a')).toBeUndefined();
  });

  it('recognises the EAN-13 read in the field and leaves alphanumeric codes unknown', () => {
    expect(inferSymbology('7898930575377')).toBe('EAN-13');
    expect(inferSymbology('7898930575378')).toBe('');
    expect(inferSymbology('MB729387468')).toBe('');
  });

  it('builds items from raw SDK payloads', () => {
    const tag = tagToItem({
      timestamp: 1790471682119,
      antenna: '',
      pc: '3400',
      rssi: '-44,10',
      count: 1,
      epc: '66C66D4F23D5340B7271F119',
      user: '',
      tid: '',
    });
    expect(tag.rssi).toBe('-44.1');
    expect(tag.tid).toBeUndefined();

    const code = barcodeToItem({
      symbology: '',
      ssiId: -1,
      hex: '37383938393330353735333737',
      value: '7898930575377',
    });
    expect(code.symbology).toBe('EAN-13');
    expect(code.captureType).toBe('barcode');
  });
});
