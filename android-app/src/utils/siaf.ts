import type { AssetType, SiafCode } from '../types';

/** SIAF account that the asset will get: the chosen model's, else the type's predominant one. */
export function siafFor(
  type: AssetType | undefined,
  modelId?: string,
): SiafCode | undefined {
  if (!type) {
    return undefined;
  }
  const model =
    type.models?.find(m => m.sys_id === modelId) ??
    type.models?.find(m => m.sys_id === type.default_model);
  const id = model?.siaf || type.siaf;
  return type.siaf_codes?.find(c => c.sys_id === id);
}

/** "123110303 · Mobiliário em geral · 10 anos · residual 10%". */
export function describeSiaf(siaf: SiafCode | undefined): string {
  if (!siaf) {
    return 'Sem conta SIAF';
  }
  const parts = [siaf.code, siaf.description];
  if (siaf.life_years) {
    parts.push(`${siaf.life_years} anos`);
  }
  if (siaf.residual_pct !== null && siaf.residual_pct !== undefined) {
    parts.push(`residual ${siaf.residual_pct}%`);
  }
  return parts.join(' · ');
}
