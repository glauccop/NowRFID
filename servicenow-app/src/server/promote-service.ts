import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'

const ITEM_TABLE = 'x_snc_nowrfid_scan_item'
const TYPE_TABLE = 'x_snc_nowrfid_asset_type'
const TAG_TABLE = 'x_snc_nowrfid_tag'
const DEFAULT_ASSET_CLASS = 'alm_asset'
// alm_asset.install_status "In use"
const INSTALL_STATUS_IN_USE = '1'

export interface PromoteResult {
    ok: boolean
    asset?: string
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
    tag.setValue('asset_type', typeId)
    const location = item.getValue('location')
    if (location) tag.setValue('location', location)
    tag.setValue('source_item', item.getUniqueValue())
    if (exists) tag.update()
    else tag.insert()
}

/** Creates the real asset for one classified staging item and links its RFID tag. */
export function promoteItem(item: GlideRecord): PromoteResult {
    const status = item.getValue('classification_status')
    if (status === 'promoted') return { ok: false, message: 'Item já promovido' }
    const typeId = item.getValue('asset_type')
    if (!typeId) return { ok: false, message: 'Item sem tipo de bem' }

    const type = new GlideRecord(TYPE_TABLE)
    if (!type.get(typeId)) return { ok: false, message: 'Tipo de bem não encontrado' }

    const model = item.getValue('model') || type.getValue('default_model')
    const category = type.getValue('model_category')
    if (!model || !category) return { ok: false, message: 'Tipo de bem sem modelo/categoria configurados' }

    let asset = new GlideRecord(type.getValue('asset_class') || DEFAULT_ASSET_CLASS)
    if (!asset.isValid()) asset = new GlideRecord(DEFAULT_ASSET_CLASS)
    asset.initialize()
    asset.setValue('model', model)
    asset.setValue('model_category', category)
    asset.setValue('install_status', INSTALL_STATUS_IN_USE)
    const location = item.getValue('location')
    if (location) asset.setValue('location', location)
    if (item.getValue('capture_type') !== 'rfid' && item.getValue('barcode_value')) {
        asset.setValue('asset_tag', item.getValue('barcode_value'))
    }
    const assetId = asset.insert()
    if (!assetId) return { ok: false, message: 'Falha ao criar o ativo' }

    if (item.getValue('capture_type') === 'rfid') upsertTag(item, assetId, typeId)

    item.setValue('promoted_asset', assetId)
    item.setValue('match_status', 'created')
    item.setValue('classification_status', 'promoted')
    item.update()
    return { ok: true, asset: assetId, message: 'Ativo criado' }
}

/** UI action entry point: runs once per selected record. */
export function promoteCurrent(current: GlideRecord) {
    const result = promoteItem(current)
    if (result.ok) gs.addInfoMessage('NowRFID: ' + result.message + ' (' + (current.getValue('epc') || current.getValue('barcode_value') || current.getUniqueValue()) + ')')
    else gs.addErrorMessage('NowRFID: ' + (current.getValue('epc') || current.getValue('barcode_value') || current.getUniqueValue()) + ' — ' + result.message)
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
