import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'
import { nextAssetTag, assetTagTaken } from './asset-tag-service.ts'

const ITEM_TABLE = 'x_snc_nowrfid_scan_item'
const TYPE_TABLE = 'x_snc_nowrfid_asset_type'
const TAG_TABLE = 'x_snc_nowrfid_tag'
const DEFAULT_ASSET_CLASS = 'alm_asset'
const SIAF_FIELD = 'u_codigo_siaf'
// alm_asset.install_status
const INSTALL_STATUS_IN_USE = '1'
const INSTALL_STATUS_IN_STOCK = '6'

export type PromoteStatus = 'created' | 'existing' | 'matched'

export interface PromoteResult {
    ok: boolean
    asset?: string
    asset_tag?: string
    status?: PromoteStatus
    /** True when the item was left untouched on purpose (no type and no known asset). */
    skipped?: boolean
    message: string
}

/** Keeps classification_status in sync when asset_type is edited (e.g. list edit in the staging list). */
export function syncClassification(current: GlideRecord, _previous: GlideRecord) {
    const status = current.getValue('classification_status')
    if (status === 'promoted' || status === 'ignored') return
    current.setValue('classification_status', current.getValue('asset_type') ? 'classified' : 'pending')
}

function upsertTag(item: GlideRecord, assetId: string, typeId: string) {
    const epc = item.getValue('epc')
    if (!epc) return
    const tag = new GlideRecord(TAG_TABLE)
    tag.addQuery('epc', epc)
    tag.addQuery('status', 'active')
    tag.setLimit(1)
    tag.query()
    const exists = tag.next()
    if (!exists) {
        tag.initialize()
        tag.setValue('epc', epc)
        tag.setValue('status', 'active')
        tag.setValue('written_at', new GlideDateTime().getValue())
    }
    const tid = item.getValue('tid')
    if (tid) tag.setValue('tid', tid)
    tag.setValue('asset', assetId)
    if (typeId) tag.setValue('asset_type', typeId)
    const location = item.getValue('location')
    if (location) tag.setValue('location', location)
    tag.setValue('source_item', item.getUniqueValue())
    if (exists) tag.update()
    else tag.insert()
}

/** Asset already bound to this EPC through an active tag, if any. */
export function assetForEpc(epc: string): string {
    if (!epc) return ''
    const tag = new GlideRecord(TAG_TABLE)
    tag.addQuery('epc', epc)
    tag.addQuery('status', 'active')
    tag.addNotNullQuery('asset')
    tag.setLimit(1)
    tag.query()
    return tag.next() ? tag.getValue('asset') : ''
}

function assetForTag(assetTag: string): GlideRecord | null {
    if (!assetTag) return null
    const gr = new GlideRecord('alm_asset')
    gr.addQuery('asset_tag', assetTag)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr : null
}

/** Room -> in use; stockroom -> in stock there. */
function applyPlacement(asset: GlideRecord, item: GlideRecord) {
    const location = item.getValue('location')
    if (location) asset.setValue('location', location)
    const stockroom = item.getValue('stockroom')
    if (stockroom) {
        asset.setValue('install_status', INSTALL_STATUS_IN_STOCK)
        asset.setValue('substatus', 'available')
        asset.setValue('stockroom', stockroom)
    } else {
        asset.setValue('install_status', INSTALL_STATUS_IN_USE)
        asset.setValue('stockroom', '')
    }
}

/** SIAF account of a model, read from its own class (u_codigo_siaf lives on sn_ent_model / cmdb_hardware_product_model). */
function siafOfModel(modelId: string): string {
    const base = new GlideRecord('cmdb_model')
    if (!modelId || !base.get(modelId)) return ''
    const model = new GlideRecord(base.getValue('sys_class_name') || 'cmdb_model')
    if (!model.isValid() || !model.isValidField(SIAF_FIELD) || !model.get(modelId)) return ''
    return model.getValue(SIAF_FIELD) || ''
}

function finish(item: GlideRecord, result: PromoteResult): PromoteResult {
    item.setValue('promoted_asset', result.asset || '')
    item.setValue('matched_asset', result.asset || '')
    item.setValue('asset_tag', result.asset_tag || '')
    item.setValue('match_status', result.status === 'created' ? 'created' : result.status === 'existing' ? 'existing' : 'matched')
    item.setValue('result_message', result.message)
    item.setValue('classification_status', 'promoted')
    item.update()
    return result
}

/** The tag or the plaqueta points to an asset that already exists: move it here instead of creating another. */
function moveExisting(item: GlideRecord, asset: GlideRecord, status: PromoteStatus): PromoteResult {
    applyPlacement(asset, item)
    asset.update()
    if (item.getValue('capture_type') === 'rfid') upsertTag(item, asset.getUniqueValue(), item.getValue('asset_type'))
    const tag = asset.getValue('asset_tag') || ''
    const message = status === 'existing' ? 'Etiqueta já cadastrada — local atualizado' : 'Etiqueta vinculada ao patrimônio ' + tag
    return finish(item, { ok: true, asset: asset.getUniqueValue(), asset_tag: tag, status, message })
}

function fail(item: GlideRecord, message: string): PromoteResult {
    item.setValue('result_message', message)
    item.update()
    return { ok: false, message }
}

/**
 * Turns one staging item into a real asset:
 * 1. EPC already bound to an asset -> move that asset (no duplicate);
 * 2. plaqueta (asset_tag, or the barcode) of an existing asset -> link the tag to it;
 * 3. otherwise create the asset with the next número de patrimônio, the type's class/category,
 *    the model's SIAF account and install_date (the SIAF job derives depreciation from it).
 */
export function promoteItem(item: GlideRecord): PromoteResult {
    if (item.getValue('classification_status') === 'promoted') return { ok: false, message: 'Item já promovido' }
    const isRfid = item.getValue('capture_type') === 'rfid'

    const boundAsset = isRfid ? assetForEpc(item.getValue('epc')) : ''
    if (boundAsset) {
        const asset = new GlideRecord('alm_asset')
        if (asset.get(boundAsset)) return moveExisting(item, asset, 'existing')
    }

    const plaqueta = item.getValue('asset_tag') || (isRfid ? '' : item.getValue('barcode_value'))
    const byTag = assetForTag(plaqueta)
    if (byTag) return moveExisting(item, byTag, 'matched')
    if (isRfid && plaqueta) return fail(item, 'Patrimônio ' + plaqueta + ' não encontrado')

    const typeId = item.getValue('asset_type')
    if (!typeId) return { ok: false, skipped: true, message: 'Item sem tipo de bem' }
    const type = new GlideRecord(TYPE_TABLE)
    if (!type.get(typeId)) return fail(item, 'Tipo de bem não encontrado')

    const model = item.getValue('model') || type.getValue('default_model')
    const category = type.getValue('model_category')
    if (!model || !category) return fail(item, 'Tipo de bem sem modelo/categoria configurados')

    let asset = new GlideRecord(type.getValue('asset_class') || DEFAULT_ASSET_CLASS)
    if (!asset.isValid()) asset = new GlideRecord(DEFAULT_ASSET_CLASS)
    asset.initialize()
    asset.setValue('model', model)
    asset.setValue('model_category', category)
    applyPlacement(asset, item)
    asset.setValue('install_date', new GlideDateTime().getValue())
    if (asset.isValidField(SIAF_FIELD)) {
        const siaf = siafOfModel(model) || type.getValue('siaf')
        if (siaf) asset.setValue(SIAF_FIELD, siaf)
    }
    // A barcode that matched nothing is a legacy plaqueta: keep its number instead of issuing a new one.
    const assetTag = !isRfid && plaqueta && !assetTagTaken(plaqueta) ? plaqueta : nextAssetTag()
    asset.setValue('asset_tag', assetTag)
    const assetId = asset.insert()
    if (!assetId) return fail(item, 'Falha ao criar o ativo')

    if (isRfid) upsertTag(item, assetId, typeId)
    return finish(item, { ok: true, asset: assetId, asset_tag: assetTag, status: 'created', message: 'Ativo criado — patrimônio ' + assetTag })
}

/** UI action entry point: runs once per selected record. */
export function promoteCurrent(current: GlideRecord) {
    const result = promoteItem(current)
    const label = current.getValue('epc') || current.getValue('barcode_value') || current.getUniqueValue()
    if (result.ok) gs.addInfoMessage('NowRFID: ' + result.message + ' (' + label + ')')
    else gs.addErrorMessage('NowRFID: ' + label + ' — ' + result.message)
}

/** Promotes every classified, not yet promoted item of a batch (used by REST/background scripts). */
export function promoteBatch(batchId: string): { promoted: number; failed: { item: string; message: string }[] } {
    const failed: { item: string; message: string }[] = []
    let promoted = 0
    const gr = new GlideRecord(ITEM_TABLE)
    gr.addQuery('batch', batchId)
    gr.addQuery('classification_status', 'classified')
    gr.query()
    while (gr.next()) {
        const r = promoteItem(gr)
        if (r.ok) promoted++
        else failed.push({ item: gr.getUniqueValue(), message: r.message })
    }
    return { promoted, failed }
}
