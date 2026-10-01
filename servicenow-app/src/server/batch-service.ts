import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'
import { assetForEpc, promoteItem } from './promote-service.ts'

const BATCH_TABLE = 'x_snc_nowrfid_scan_batch'
const ITEM_TABLE = 'x_snc_nowrfid_scan_item'
const CAPTURE_TYPES = ['rfid', 'barcode', 'qr']
const OPERATIONS = ['read', 'write']
/** 'true' = create/move the assets as soon as the batch arrives (PoC flow); 'false' = admin promotes later. */
export const AUTO_PROMOTE_PROPERTY = 'x_snc_nowrfid.auto_promote'

export interface BatchPayload {
    client_batch_id?: string
    device_id?: string
    reader_mac?: string
    captured_at?: string
    app_version?: string
    notes?: string
    location?: string
    asset_type?: string
    stockroom?: string
}

export interface ItemPayload {
    client_item_id?: string
    capture_type?: string
    operation?: string
    epc?: string
    tid?: string
    user_data?: string
    rssi?: string | number
    read_count?: number
    barcode_value?: string
    symbology?: string
    captured_at?: string
    raw_payload?: string | object
    location?: string
    asset_type?: string
    stockroom?: string
    model?: string
    asset_tag?: string
}

export interface ItemOutcome {
    client_item_id: string
    status: 'created' | 'existing' | 'matched' | 'pending' | 'error'
    asset_tag?: string
    asset_sys_id?: string
    message: string
}

export interface SubmitResult {
    status: number
    body: {
        batch_sys_id?: string
        batch_number?: string
        items_created?: number
        duplicate?: boolean
        pending?: number
        classified?: number
        existing?: number
        outcomes?: ItemOutcome[]
        errors: { client_item_id: string; message: string }[]
        error?: string
    }
}

function str(value: unknown, max: number): string {
    if (value === undefined || value === null) return ''
    const s = typeof value === 'string' ? value : String(value)
    return s.length > max ? s.substring(0, max) : s
}

/** ISO8601 ("2026-09-24T18:30:00.123Z" or with offset) -> GlideDateTime in UTC. Empty string when unparseable. */
export function isoToGlideUtc(iso?: string): string {
    if (!iso) return ''
    const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/.exec(iso.trim())
    if (!m) return ''
    let ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])
    const tz = m[7]
    if (tz && tz !== 'Z') {
        const sign = tz[0] === '-' ? -1 : 1
        const digits = tz.substring(1).replace(':', '')
        const offsetMin = parseInt(digits.substring(0, 2), 10) * 60 + parseInt(digits.substring(2, 4), 10)
        ms -= sign * offsetMin * 60000
    }
    const d = new Date(ms)
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
    const value =
        d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' +
        pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds())
    const gdt = new GlideDateTime()
    gdt.setValueUTC(value, 'yyyy-MM-dd HH:mm:ss')
    return gdt.isValid() ? gdt.getValue() : ''
}

/** Returns a checker telling whether a sys_id exists in a table, memoised for one request. Empty = valid "no reference". */
function makeRefChecker() {
    const cache: { [key: string]: boolean } = {}
    return (table: string, sysId: string): boolean => {
        if (!sysId) return true
        const key = table + ':' + sysId
        if (cache[key] === undefined) {
            const gr = new GlideRecord(table)
            cache[key] = gr.get(sysId)
        }
        return cache[key]
    }
}

function findBatch(clientBatchId: string): GlideRecord | null {
    const gr = new GlideRecord(BATCH_TABLE)
    gr.addQuery('client_batch_id', clientBatchId)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr : null
}

function countItems(batchSysId: string): number {
    const gr = new GlideRecord(ITEM_TABLE)
    gr.addQuery('batch', batchSysId)
    gr.query()
    return gr.getRowCount()
}

export function submitBatch(payload: any, options: { autoPromote?: boolean } = {}): SubmitResult {
    const errors: { client_item_id: string; message: string }[] = []
    if (!payload || typeof payload !== 'object') {
        return { status: 400, body: { errors, error: 'Body must be a JSON object' } }
    }
    const batch: BatchPayload = payload.batch || {}
    const items: ItemPayload[] = payload.items
    const clientBatchId = str(batch.client_batch_id, 64).trim()
    if (!clientBatchId) {
        return { status: 400, body: { errors, error: 'batch.client_batch_id is required' } }
    }
    if (!Array.isArray(items) || items.length === 0) {
        return { status: 400, body: { errors, error: 'items must be a non-empty array' } }
    }

    const existing = findBatch(clientBatchId)
    if (existing) {
        const sysId = existing.getUniqueValue()
        return {
            status: 200,
            body: {
                batch_sys_id: sysId,
                batch_number: existing.getValue('number'),
                items_created: countItems(sysId),
                duplicate: true,
                outcomes: storedOutcomes(sysId),
                errors,
            },
        }
    }

    const b = new GlideRecord(BATCH_TABLE)
    b.initialize()
    b.setValue('client_batch_id', clientBatchId)
    b.setValue('device_id', str(batch.device_id, 100))
    b.setValue('reader_mac', str(batch.reader_mac, 40))
    b.setValue('app_version', str(batch.app_version, 40))
    b.setValue('notes', str(batch.notes, 1000))
    const refExists = makeRefChecker()
    const batchLocation = str(batch.location, 32)
    const batchAssetType = str(batch.asset_type, 32)
    if (!refExists('cmn_location', batchLocation)) {
        return { status: 400, body: { errors, error: 'batch.location not found: ' + batchLocation } }
    }
    if (!refExists('x_snc_nowrfid_asset_type', batchAssetType)) {
        return { status: 400, body: { errors, error: 'batch.asset_type not found: ' + batchAssetType } }
    }
    const batchStockroom = str(batch.stockroom, 32)
    if (!refExists('alm_stockroom', batchStockroom)) {
        return { status: 400, body: { errors, error: 'batch.stockroom not found: ' + batchStockroom } }
    }
    if (batchLocation) b.setValue('location', batchLocation)
    if (batchAssetType) b.setValue('asset_type', batchAssetType)
    b.setValue('source', 'app')
    b.setValue('operator', gs.getUserID())
    b.setValue('status', 'new')
    const capturedAt = isoToGlideUtc(batch.captured_at)
    if (capturedAt) b.setValue('captured_at', capturedAt)
    b.setValue('received_at', new GlideDateTime().getValue())
    const batchSysId = b.insert()
    if (!batchSysId) {
        return { status: 500, body: { errors, error: 'Failed to create batch' } }
    }

    let created = 0
    let pending = 0
    let classified = 0
    let alreadyTagged = 0
    const inserted: { id: string; clientItemId: string }[] = []
    for (let i = 0; i < items.length; i++) {
        const it = items[i] || {}
        const clientItemId = str(it.client_item_id, 64) || 'index:' + i
        const captureType = str(it.capture_type, 20).toLowerCase()
        const operation = str(it.operation || 'read', 20).toLowerCase()
        if (CAPTURE_TYPES.indexOf(captureType) < 0) {
            errors.push({ client_item_id: clientItemId, message: 'invalid capture_type: ' + captureType })
            continue
        }
        if (OPERATIONS.indexOf(operation) < 0) {
            errors.push({ client_item_id: clientItemId, message: 'invalid operation: ' + operation })
            continue
        }
        if (captureType === 'rfid' && !it.epc) {
            errors.push({ client_item_id: clientItemId, message: 'epc is required for rfid items' })
            continue
        }
        if (captureType !== 'rfid' && !it.barcode_value) {
            errors.push({ client_item_id: clientItemId, message: 'barcode_value is required for barcode/qr items' })
            continue
        }
        const itemLocation = str(it.location, 32) || batchLocation
        const itemAssetType = str(it.asset_type, 32) || batchAssetType
        if (!refExists('cmn_location', itemLocation)) {
            errors.push({ client_item_id: clientItemId, message: 'location not found: ' + itemLocation })
            continue
        }
        if (!refExists('x_snc_nowrfid_asset_type', itemAssetType)) {
            errors.push({ client_item_id: clientItemId, message: 'asset_type not found: ' + itemAssetType })
            continue
        }
        const itemStockroom = str(it.stockroom, 32) || batchStockroom
        const itemModel = str(it.model, 32)
        if (!refExists('alm_stockroom', itemStockroom)) {
            errors.push({ client_item_id: clientItemId, message: 'stockroom not found: ' + itemStockroom })
            continue
        }
        if (!refExists('cmdb_model', itemModel)) {
            errors.push({ client_item_id: clientItemId, message: 'model not found: ' + itemModel })
            continue
        }
        const gr = new GlideRecord(ITEM_TABLE)
        gr.initialize()
        if (itemLocation) gr.setValue('location', itemLocation)
        if (itemAssetType) gr.setValue('asset_type', itemAssetType)
        if (itemStockroom) gr.setValue('stockroom', itemStockroom)
        if (itemModel) gr.setValue('model', itemModel)
        gr.setValue('asset_tag', str(it.asset_tag, 40).trim())
        gr.setValue('classification_status', itemAssetType ? 'classified' : 'pending')
        gr.setValue('batch', batchSysId)
        gr.setValue('client_item_id', clientItemId)
        gr.setValue('capture_type', captureType)
        gr.setValue('operation', operation)
        gr.setValue('epc', str(it.epc, 128).toUpperCase())
        gr.setValue('tid', str(it.tid, 128).toUpperCase())
        gr.setValue('user_data', str(it.user_data, 1000))
        gr.setValue('rssi', str(it.rssi, 20))
        gr.setValue('read_count', typeof it.read_count === 'number' ? Math.floor(it.read_count) : 0)
        gr.setValue('barcode_value', str(it.barcode_value, 1000))
        gr.setValue('symbology', str(it.symbology, 60))
        const itemAt = isoToGlideUtc(it.captured_at)
        if (itemAt) gr.setValue('captured_at', itemAt)
        const raw = typeof it.raw_payload === 'string' ? it.raw_payload : it.raw_payload ? JSON.stringify(it.raw_payload) : ''
        gr.setValue('raw_payload', str(raw, 4000))
        // Same tag read again (another batch, another day): flag it now so nobody creates a second asset.
        const known = captureType === 'rfid' ? assetForEpc(str(it.epc, 128).toUpperCase()) : ''
        gr.setValue('match_status', known ? 'existing' : 'unmatched')
        if (known) {
            gr.setValue('matched_asset', known)
            alreadyTagged++
        }
        const itemSysId = gr.insert()
        if (itemSysId) {
            inserted.push({ id: itemSysId, clientItemId })
            created++
            if (itemAssetType) classified++
            else pending++
        } else {
            errors.push({ client_item_id: clientItemId, message: 'insert failed' })
        }
    }

    b.setValue('item_count', created)
    if (created === 0) b.setValue('status', 'error')
    b.update()

    const autoPromote = options.autoPromote !== undefined ? options.autoPromote : gs.getProperty(AUTO_PROMOTE_PROPERTY, 'true') === 'true'
    const outcomes = autoPromote ? promoteInserted(inserted) : undefined

    return {
        status: 201,
        body: {
            batch_sys_id: batchSysId,
            batch_number: b.getValue('number'),
            items_created: created,
            duplicate: false,
            pending,
            classified,
            existing: alreadyTagged,
            outcomes,
            errors,
        },
    }
}

const MATCH_TO_OUTCOME: { [k: string]: ItemOutcome['status'] } = { created: 'created', existing: 'existing', matched: 'matched' }

/** Outcomes of a batch that was already processed (the app retried after a timeout). */
function storedOutcomes(batchSysId: string): ItemOutcome[] {
    const outcomes: ItemOutcome[] = []
    const gr = new GlideRecord(ITEM_TABLE)
    gr.addQuery('batch', batchSysId)
    gr.query()
    while (gr.next()) {
        const promoted = gr.getValue('classification_status') === 'promoted'
        outcomes.push({
            client_item_id: gr.getValue('client_item_id') || '',
            status: promoted ? MATCH_TO_OUTCOME[gr.getValue('match_status')] || 'created' : gr.getValue('result_message') ? 'error' : 'pending',
            asset_tag: gr.getValue('asset_tag') || undefined,
            asset_sys_id: gr.getValue('promoted_asset') || undefined,
            message: gr.getValue('result_message') || '',
        })
    }
    return outcomes
}

/** Auto-promotion right after the batch is stored; returns what happened to each item for the app. */
function promoteInserted(inserted: { id: string; clientItemId: string }[]): ItemOutcome[] {
    const outcomes: ItemOutcome[] = []
    for (const entry of inserted) {
        const gr = new GlideRecord(ITEM_TABLE)
        if (!gr.get(entry.id)) continue
        const r = promoteItem(gr)
        outcomes.push({
            client_item_id: entry.clientItemId,
            status: r.ok ? r.status || 'created' : r.skipped ? 'pending' : 'error',
            asset_tag: r.asset_tag,
            asset_sys_id: r.asset,
            message: r.message,
        })
    }
    return outcomes
}
