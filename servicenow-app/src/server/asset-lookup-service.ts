import { GlideRecord } from '@servicenow/glide'

interface LookupInput {
    epc?: string
    tid?: string
    barcode?: string
}

const ASSET_LIMIT = 5

function clean(value: unknown): string {
    return value === undefined || value === null ? '' : String(value).trim()
}

function locationPath(sysId: string): string {
    if (!sysId) return ''
    const loc = new GlideRecord('cmn_location')
    if (!loc.get(sysId)) return ''
    return loc.getValue('full_name') || loc.getDisplayValue('name') || ''
}

function describeAsset(asset: GlideRecord) {
    const locationId = asset.getValue('location') || ''
    return {
        sys_id: asset.getUniqueValue(),
        asset_tag: asset.getValue('asset_tag') || '',
        name: asset.getDisplayValue('display_name') || asset.getDisplayValue('model') || '',
        class: asset.getValue('sys_class_name') || '',
        model: asset.getDisplayValue('model'),
        category: asset.getDisplayValue('model_category'),
        serial_number: asset.getValue('serial_number') || '',
        status: asset.getDisplayValue('install_status'),
        location: asset.getDisplayValue('location'),
        location_path: locationPath(locationId),
        stockroom: asset.getDisplayValue('stockroom'),
        assigned_to: asset.getDisplayValue('assigned_to'),
    }
}

function loadAsset(sysId: string) {
    const asset = new GlideRecord('alm_asset')
    return sysId && asset.get(sysId) ? describeAsset(asset) : null
}

/** EPC/TID -> asset through the tag registry; active tags win over replaced/killed ones. */
function viaTag(field: 'epc' | 'tid', value: string) {
    const tag = new GlideRecord('x_snc_nowrfid_tag')
    tag.addQuery(field, value)
    tag.addNotNullQuery('asset')
    tag.orderBy('status')
    tag.orderByDesc('sys_updated_on')
    tag.query()
    const assets: any[] = []
    const seen: Record<string, boolean> = {}
    while (tag.next() && assets.length < ASSET_LIMIT) {
        const id = tag.getValue('asset')
        if (seen[id]) continue
        seen[id] = true
        const asset = loadAsset(id)
        if (asset) assets.push({ ...asset, tag_status: tag.getValue('status') })
    }
    return assets
}

/** Plaqueta / número de patrimônio -> asset (exact, then serial number). */
function viaBarcode(value: string) {
    const assets: any[] = []
    for (const field of ['asset_tag', 'serial_number']) {
        const asset = new GlideRecord('alm_asset')
        asset.addQuery(field, value)
        asset.setLimit(ASSET_LIMIT)
        asset.query()
        while (asset.next()) assets.push(describeAsset(asset))
        if (assets.length) break
    }
    return assets
}

/** Captured but not (yet) turned into an asset: tells the user where the item is in the workflow. */
function viaStaging(input: LookupInput) {
    const item = new GlideRecord('x_snc_nowrfid_scan_item')
    const epc = clean(input.epc).toUpperCase()
    const tid = clean(input.tid).toUpperCase()
    const code = clean(input.barcode)
    if (epc) item.addQuery('epc', epc)
    else if (tid) item.addQuery('tid', tid)
    else if (code) item.addQuery('barcode_value', code)
    else return null
    item.orderByDesc('sys_created_on')
    item.setLimit(1)
    item.query()
    if (!item.next()) return null
    return {
        batch: item.getDisplayValue('batch'),
        classification: item.getValue('classification_status'),
        location: item.getDisplayValue('location'),
        asset_type: item.getDisplayValue('asset_type'),
        captured_at: item.getValue('captured_at') || item.getValue('sys_created_on'),
    }
}

export function lookupAsset(input: LookupInput): { status: number; body: any } {
    const epc = clean(input.epc).toUpperCase()
    const tid = clean(input.tid).toUpperCase()
    const barcode = clean(input.barcode)
    if (!epc && !tid && !barcode) {
        return { status: 400, body: { error: 'Informe epc, tid ou barcode' } }
    }

    let matchedBy = ''
    let assets: any[] = []
    if (epc) {
        assets = viaTag('epc', epc)
        matchedBy = 'tag_epc'
    }
    if (!assets.length && tid) {
        assets = viaTag('tid', tid)
        matchedBy = 'tag_tid'
    }
    if (!assets.length && barcode) {
        assets = viaBarcode(barcode)
        matchedBy = 'asset_tag'
    }
    return {
        status: 200,
        body: {
            found: assets.length > 0,
            matched_by: assets.length ? matchedBy : '',
            assets,
            staging: assets.length ? null : viaStaging({ epc, tid, barcode }),
        },
    }
}
