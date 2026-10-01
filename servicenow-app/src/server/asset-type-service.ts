import { gs, GlideRecord } from '@servicenow/glide'

const TYPE_TABLE = 'x_snc_nowrfid_asset_type'
const SIAF_TABLE = 'u_siaf_codigos'
const SIAF_FIELD = 'u_codigo_siaf'

/** Prefix of the SIAF account that defines the discipline (1231… = bens móveis permanentes). */
export const SIAF_PREFIX_PROPERTY = 'x_snc_nowrfid.siaf_prefix'
const DEFAULT_SIAF_PREFIX = '1231'
/** Model classes that carry u_codigo_siaf. */
const MODEL_TABLES = ['sn_ent_model', 'cmdb_hardware_product_model']
/** Asset classes that carry u_codigo_siaf. */
const ASSET_TABLES = ['sn_ent_facility_asset', 'alm_hardware']

export interface SiafInfo {
    sys_id: string
    code: string
    description: string
    life_years: number | null
    residual_pct: number | null
}

export interface ModelInfo {
    sys_id: string
    name: string
    siaf: string
    assets: number
}

/** Icon shown on the app tile, by keyword in the category name. */
const ICONS: [RegExp, string][] = [
    [/CADEIRA|POLTRONA|SOFA/i, '🪑'],
    [/MESA|ESTACAO/i, '🗄️'],
    [/ARMARIO|GAVETEIRO|ESTANTE|MOBILIARIO|FURNITURE/i, '🗄️'],
    [/LIVRO|BOOK/i, '📚'],
    [/MONITOR|DISPLAY/i, '🖥️'],
    [/COMPUTER|NOTEBOOK|LAPTOP/i, '💻'],
    [/PHONE|TELEFONE/i, '☎️'],
    [/PRINTER|IMPRESSORA/i, '🖨️'],
    [/SCANNER/i, '🖨️'],
    [/UPS|NOBREAK/i, '🔋'],
    [/CAMERA/i, '📷'],
    [/MICROFONE|FONE/i, '🎧'],
    [/GELADEIRA|BEBEDOURO|PURIFICADOR/i, '🧊'],
    [/AR CONDICIONADO|CIRCULADOR/i, '❄️'],
    [/FERRAMENTA|TOOL/i, '🔧'],
    [/FRAGMENTADORA/i, '🗑️'],
]

function iconFor(name: string): string {
    for (const [re, icon] of ICONS) if (re.test(name)) return icon
    return '📦'
}

/** "ESTACAO DE TRABALHO" -> "Estação de trabalho"-like display; mixed-case names stay as they are. */
export function displayName(name: string): string {
    if (name !== name.toUpperCase()) return name
    const lower = name.toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
}

let siafCache: { [id: string]: SiafInfo } | null = null

export function getSiaf(sysId: string): SiafInfo | null {
    if (!sysId) return null
    if (!siafCache) siafCache = {}
    if (!siafCache[sysId]) {
        const gr = new GlideRecord(SIAF_TABLE)
        if (!gr.isValid() || !gr.get(sysId)) return null
        const num = (f: string) => (gr.getValue(f) === null || gr.getValue(f) === '' ? null : parseInt(gr.getValue(f), 10))
        siafCache[sysId] = {
            sys_id: sysId,
            code: gr.getValue('u_codigo_raw') || '',
            description: gr.getValue('u_descricao') || '',
            life_years: num('u_vida_util_anos'),
            residual_pct: num('u_valor_residual_pct'),
        }
    }
    return siafCache[sysId]
}

function topKey(counts: { [k: string]: number }): string {
    let best = ''
    let max = -1
    for (const k in counts) {
        if (counts[k] > max) {
            max = counts[k]
            best = k
        }
    }
    return best
}

interface CategoryStats {
    siaf: { [siafId: string]: number }
    models: { [modelId: string]: { name: string; siaf: string; assets: number; siafVotes: { [id: string]: number } } }
    assetClass: { [table: string]: number }
}

/**
 * Scans models and assets that carry a SIAF account of the discipline and groups them by category.
 * The SIAF belongs to the model; assets only fill in when the model has none (e.g. Computer).
 */
export function collectCategories(): { [categoryId: string]: CategoryStats } {
    const prefix = gs.getProperty(SIAF_PREFIX_PROPERTY, DEFAULT_SIAF_PREFIX)
    const cats: { [id: string]: CategoryStats } = {}
    const stats = (id: string) => (cats[id] = cats[id] || { siaf: {}, models: {}, assetClass: {} })
    const modelEntry = (s: CategoryStats, id: string, name: string) =>
        (s.models[id] = s.models[id] || { name, siaf: '', assets: 0, siafVotes: {} })

    for (const table of MODEL_TABLES) {
        const gr = new GlideRecord(table)
        if (!gr.isValid()) continue
        gr.addQuery(SIAF_FIELD + '.u_codigo_raw', 'STARTSWITH', prefix)
        gr.query()
        while (gr.next()) {
            const siaf = gr.getValue(SIAF_FIELD)
            // cmdb_model_category is a list: a model may sit in several categories.
            for (const cat of (gr.getValue('cmdb_model_category') || '').split(',')) {
                if (!cat) continue
                const s = stats(cat)
                s.siaf[siaf] = (s.siaf[siaf] || 0) + 1
                modelEntry(s, gr.getUniqueValue(), gr.getValue('display_name') || gr.getValue('name') || '').siaf = siaf
            }
        }
    }

    for (const table of ASSET_TABLES) {
        const gr = new GlideRecord(table)
        if (!gr.isValid()) continue
        gr.addQuery(SIAF_FIELD + '.u_codigo_raw', 'STARTSWITH', prefix)
        gr.addNotNullQuery('model_category')
        gr.query()
        while (gr.next()) {
            const cat = gr.getValue('model_category')
            const siaf = gr.getValue(SIAF_FIELD)
            const s = stats(cat)
            s.siaf[siaf] = (s.siaf[siaf] || 0) + 1
            s.assetClass[table] = (s.assetClass[table] || 0) + 1
            const modelId = gr.getValue('model')
            if (modelId) {
                const m = modelEntry(s, modelId, gr.getDisplayValue('model') || '')
                m.assets++
                m.siafVotes[siaf] = (m.siafVotes[siaf] || 0) + 1
            }
        }
    }

    for (const id in cats) {
        for (const modelId in cats[id].models) {
            const m = cats[id].models[modelId]
            if (!m.siaf) m.siaf = topKey(m.siafVotes)
        }
    }
    return cats
}

/**
 * Upserts one Tipo de bem per category of the discipline (source=category) and deactivates the
 * category-sourced ones that no longer qualify. Manual rows are never touched.
 */
export function syncAssetTypes(): { created: number; updated: number; deactivated: number; total: number } {
    const cats = collectCategories()
    let created = 0
    let updated = 0
    let deactivated = 0

    for (const catId in cats) {
        const cat = new GlideRecord('cmdb_model_category')
        if (!cat.get(catId)) continue
        const s = cats[catId]
        const name = cat.getValue('name') || ''
        let defaultModel = ''
        let maxAssets = -1
        for (const modelId in s.models) {
            if (s.models[modelId].assets > maxAssets) {
                maxAssets = s.models[modelId].assets
                defaultModel = modelId
            }
        }
        const assetClass = cat.getValue('asset_class') || topKey(s.assetClass) || 'alm_asset'

        const t = new GlideRecord(TYPE_TABLE)
        t.addQuery('model_category', catId)
        t.setLimit(1)
        t.query()
        const exists = t.next()
        if (exists && t.getValue('source') === 'manual') continue
        if (!exists) {
            t.initialize()
            t.setValue('model_category', catId)
            t.setValue('source', 'category')
            t.setValue('icon', iconFor(name))
        }
        t.setValue('name', displayName(name))
        t.setValue('active', true)
        t.setValue('asset_class', assetClass)
        t.setValue('siaf', topKey(s.siaf))
        if (defaultModel) t.setValue('default_model', defaultModel)
        if (exists) {
            t.update()
            updated++
        } else {
            t.insert()
            created++
        }
    }

    const stale = new GlideRecord(TYPE_TABLE)
    stale.addQuery('source', 'category')
    stale.addQuery('active', true)
    stale.query()
    while (stale.next()) {
        if (!cats[stale.getValue('model_category')]) {
            stale.setValue('active', false)
            stale.update()
            deactivated++
        }
    }
    return { created, updated, deactivated, total: created + updated }
}

/** Generates the types once, so a fresh install works without an admin step. */
export function ensureAssetTypes() {
    const gr = new GlideRecord(TYPE_TABLE)
    gr.addQuery('source', 'category')
    gr.setLimit(1)
    gr.query()
    if (!gr.hasNext()) syncAssetTypes()
}

/** Active types with their SIAF account and the models the operator can choose from. */
export function listAssetTypes(): any[] {
    const cats = collectCategories()
    const types: any[] = []
    const gr = new GlideRecord(TYPE_TABLE)
    gr.addQuery('active', true)
    gr.orderBy('order')
    gr.orderBy('name')
    gr.query()
    while (gr.next()) {
        const catId = gr.getValue('model_category') || ''
        const models: ModelInfo[] = []
        const stats = cats[catId]
        if (stats) {
            for (const id in stats.models) {
                const m = stats.models[id]
                models.push({ sys_id: id, name: m.name, siaf: m.siaf, assets: m.assets })
            }
            models.sort((a, b) => b.assets - a.assets || (a.name < b.name ? -1 : 1))
        }
        const siafIds: { [id: string]: boolean } = {}
        const typeSiaf = gr.getValue('siaf') || ''
        if (typeSiaf) siafIds[typeSiaf] = true
        models.forEach(m => m.siaf && (siafIds[m.siaf] = true))
        const siaf: SiafInfo[] = []
        for (const id in siafIds) {
            const info = getSiaf(id)
            if (info) siaf.push(info)
        }
        types.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name') || '',
            icon: gr.getValue('icon') || '',
            order: parseInt(gr.getValue('order') || '0', 10),
            model_category: catId,
            asset_class: gr.getValue('asset_class') || 'alm_asset',
            siaf: typeSiaf,
            default_model: gr.getValue('default_model') || '',
            models,
            siaf_codes: siaf,
        })
    }
    return types
}

/** UI action on the Tipo de bem list. */
export function syncAssetTypesAction() {
    const r = syncAssetTypes()
    gs.addInfoMessage('NowRFID: ' + r.created + ' tipos criados, ' + r.updated + ' atualizados, ' + r.deactivated + ' desativados')
}
