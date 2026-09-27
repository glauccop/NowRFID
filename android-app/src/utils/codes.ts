/** SDK formats RSSI with the device locale ("-44,10" on pt-BR phones). */
export function normalizeRssi(rssi: string | undefined): string | undefined {
  if (!rssi) {
    return undefined;
  }
  const value = Number(rssi.trim().replace(',', '.'));
  return Number.isFinite(value) ? value.toFixed(1) : undefined;
}

function gtinCheckDigitOk(digits: string): boolean {
  const body = digits.slice(0, -1);
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const weight = (body.length - i) % 2 === 1 ? 3 : 1;
    sum += Number(body[i]) * weight;
  }
  return (10 - (sum % 10)) % 10 === Number(digits[digits.length - 1]);
}

/**
 * Fallback when the imager does not report the symbology (field log: ssiId=-1).
 * Only GTIN families can be recognised from content alone.
 */
export function inferSymbology(value: string): string {
  if (/^\d+$/.test(value) && gtinCheckDigitOk(value)) {
    if (value.length === 13) {
      return 'EAN-13';
    }
    if (value.length === 8) {
      return 'EAN-8';
    }
    if (value.length === 12) {
      return 'UPC-A';
    }
    if (value.length === 14) {
      return 'GTIN-14';
    }
  }
  return '';
}
