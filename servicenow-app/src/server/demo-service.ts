import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'
import { submitBatch } from './batch-service.ts'
import { promoteItem } from './promote-service.ts'
import { ensureAssetTypes } from './asset-type-service.ts'
import { entityTree, getStockrooms } from './structure-service.ts'

/** Every demo batch carries this device id; that is how the demo data is found and removed. */
export const DEMO_DEVICE = 'nowrfid-demo'
const BATCH_TABLE = 'x_snc_nowrfid_scan_batch'
const ITEM_TABLE = 'x_snc_nowrfid_scan_item'
const TAG_TABLE = 'x_snc_nowrfid_tag'
const EPC_PREFIX = 'E28011700000'

interface DemoItem {
    type?: string
    /** Existing patrimônio to pair with the tag (fluxo "Já tem plaqueta"). */
    assetTag?: string
    /** Re-read of an EPC from an earlier demo batch. */
    epc?: string
    promote: boolean
}

interface DemoBatch {
    key: string
    notes: string
    daysAgo: number
    room?: string
    stockroom?: string
    items: DemoItem[]
}

let epcSeq = 0
function nextEpc(): string {
    epcSeq++
    let hex = epcSeq.toString(16).toUpperCase()
    while (hex.length < 12) hex = '0' + hex
    return EPC_PREFIX + hex
}

function isoDaysAgo(days: number, hour: number): string {
    const d = new Date(Date.now() - days * 86400000)
    d.setUTCHours(hour, 15, 0, 0)
    return d.toISOString()
}

function glideDaysAgo(days: number, hour: number): string {
    return isoDaysAgo(days, hour).replace('T', ' ').substring(0, 19)
}

function typeId(name: string): string {
    const gr = new GlideRecord('x_snc_nowrfid_asset_type')
    gr.addQuery('name', name)
    gr.addQuery('active', true)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr.getUniqueValue() : ''
}

/** Rooms of the entity tree whose name starts with one of the TJDFT room codes (fallback: any room). */
function rooms(): { [code: string]: string } {
    const tree = entityTree()
    const parents: { [id: string]: boolean } = {}
    tree.locations.forEach(l => l.parent && (parents[l.parent] = true))
    const leaves = tree.locations.filter(l => l.kind !== 'entity' && !parents[l.sys_id])
    const byCode: { [code: string]: string } = {}
    for (const code of ['3001148', '3501222', '0509919', '0507SEM', '01SSEMA']) {
        const room = leaves.filter(l => l.name.indexOf(code) === 0)[0]
        if (room) byCode[code] = room.sys_id
    }
    return byCode
}

/** Existing patrimônios in a room without an RFID tag yet: the plaquetas used by the pairing scene. */
function untaggedAssets(locationId: string, limit: number): string[] {
    const tags: string[] = []
    const gr = new GlideRecord('alm_asset')
    gr.addQuery('location', locationId)
    gr.addNotNullQuery('asset_tag')
    gr.orderBy('asset_tag')
    gr.query()
    while (gr.next() && tags.length < limit) {
        const tag = new GlideRecord(TAG_TABLE)
        tag.addQuery('asset', gr.getUniqueValue())
        tag.addQuery('status', 'active')
        tag.query()
        if (!tag.hasNext()) tags.push(gr.getValue('asset_tag'))
    }
    return tags
}

function demoExists(): boolean {
    const gr = new GlideRecord(BATCH_TABLE)
    gr.addQuery('device_id', DEMO_DEVICE)
    gr.setLimit(1)
    gr.query()
    return gr.hasNext()
}

/** Back-dates a record so the dashboard's per-day chart shows activity over the last days. */
function backdate(table: string, query: string, value: string) {
    const gr = new GlideRecord(table)
    gr.addEncodedQuery(query)
    gr.query()
    while (gr.next()) {
        gr.setValue('sys_created_on', value)
        gr.setWorkflow(false)
        gr.update()
    }
}

/**
 * NowRFID demo data on the customer's real structure, created through the same pipeline the app
 * uses (submitBatch + promoteItem), so assets get real patrimônio numbers, SIAF accounts and tags:
 * stock entries in two almoxarifados, rooms filled in use, plaquetas paired with existing assets,
 * a classified batch waiting for "Criar ativos", items to classify, and a re-read of a known tag.
 * Idempotent: does nothing when demo batches already exist.
 */
export function seedDemoData(): { batches: number; items: number; promoted: number; skipped?: string } {
    if (demoExists()) return { batches: 0, items: 0, promoted: 0, skipped: 'Massa de demonstração já existe' }
    ensureAssetTypes()
    const room = rooms()
    const stockrooms = getStockrooms()
    const store = (code: string) => (stockrooms.filter(s => s.name.indexOf(code) >= 0)[0] || { sys_id: '', location: '' })
    const central = store('AMXCENT')
    const distrib = store('AMXDIST')
    const pairing = room['3501222'] ? untaggedAssets(room['3501222'], 3) : []

    const n = (type: string, count: number, promote = true): DemoItem[] => {
        const list: DemoItem[] = []
        for (let i = 0; i < count; i++) list.push({ type, promote })
        return list
    }
    const firstEpcOfSala148: DemoItem = { type: 'Poltrona', epc: '', promote: true }

    const plan: DemoBatch[] = [
        {
            key: 'entrada-amxcent',
            notes: 'NowRFID demo — entrada de bens novos no Almoxarifado Central',
            daysAgo: 9,
            stockroom: central.sys_id,
            items: [...n('Cadeira', 4), ...n('Monitor', 2), ...n('Computer', 2)],
        },
        {
            key: 'entrada-amxdist',
            notes: 'NowRFID demo — entrada no Almoxarifado de Distribuição',
            daysAgo: 7,
            stockroom: distrib.sys_id,
            items: [...n('Mesa', 2), ...n('Armario', 2)],
        },
        {
            key: 'sala-148',
            notes: 'NowRFID demo — mobiliário novo na 1ª Vara Criminal de Taguatinga (sala 148)',
            daysAgo: 5,
            room: room['3001148'],
            items: [...n('Poltrona', 2), ...n('Gaveteiro', 2), ...n('Estacao de trabalho', 2)],
        },
        {
            key: 'plaquetas-ceilandia',
            notes: 'NowRFID demo — etiquetagem do acervo: plaquetas existentes vinculadas às tags (Ceilândia, sala 222)',
            daysAgo: 3,
            room: room['3501222'],
            items: [...pairing.map(tag => ({ assetTag: tag, promote: true })), ...n('IP Phone', 1)],
        },
        {
            key: 'cja-919',
            notes: 'NowRFID demo — lote classificado aguardando "Criar ativos" (CJA, sala 919)',
            daysAgo: 1,
            room: room['0509919'],
            items: [...n('Livro', 3, false), ...n('Estante', 2, false)],
        },
        {
            key: 'sema-707',
            notes: 'NowRFID demo — itens a classificar e releitura de uma tag já cadastrada (SEMA, sala 707)',
            daysAgo: 0,
            room: room['0507SEM'],
            items: [{ promote: false }, { promote: false }, { promote: false }, firstEpcOfSala148],
        },
    ]

    let batches = 0
    let items = 0
    let promoted = 0
    plan.forEach((demo, b) => {
        const location = demo.room || (demo.stockroom === central.sys_id ? central.location : distrib.location)
        if (!location || !demo.items.length) return
        const types: { [name: string]: string } = {}
        const payloadItems = demo.items.map((it, i) => {
            if (it.type && types[it.type] === undefined) types[it.type] = typeId(it.type)
            return {
                client_item_id: 'demo-' + demo.key + '-' + i,
                capture_type: 'rfid',
                operation: 'read',
                epc: it.epc || nextEpc(),
                tid: 'E2801170' + (2000000000000000 + b * 100 + i),
                rssi: String(-40 - ((i * 7) % 25)),
                read_count: 3 + ((i * 5) % 19),
                captured_at: isoDaysAgo(demo.daysAgo, 13 + (i % 4)),
                location,
                stockroom: demo.stockroom || '',
                asset_type: it.type ? types[it.type] : '',
                asset_tag: it.assetTag || '',
            }
        })
        const result = submitBatch(
            {
                batch: {
                    client_batch_id: 'nowrfid-demo-' + demo.key,
                    device_id: DEMO_DEVICE,
                    reader_mac: 'D7:3B:AA:46:B4:E0',
                    captured_at: isoDaysAgo(demo.daysAgo, 13),
                    app_version: 'demo',
                    notes: demo.notes,
                    location,
                    stockroom: demo.stockroom || '',
                },
                items: payloadItems,
            },
            { autoPromote: false },
        )
        const batchId = result.body.batch_sys_id
        if (!batchId) return
        batches++
        items += result.body.items_created || 0
        // Keep the first EPC of the sala 148 batch for the re-read scene.
        if (demo.key === 'sala-148') firstEpcOfSala148.epc = payloadItems[0].epc

        demo.items.forEach((it, i) => {
            if (!it.promote) return
            const gr = new GlideRecord(ITEM_TABLE)
            gr.addQuery('batch', batchId)
            gr.addQuery('client_item_id', 'demo-' + demo.key + '-' + i)
            gr.query()
            if (gr.next() && promoteItem(gr).ok) promoted++
        })
        const when = glideDaysAgo(demo.daysAgo, 13)
        backdate(BATCH_TABLE, 'sys_id=' + batchId, when)
        backdate(ITEM_TABLE, 'batch=' + batchId, when)
    })
    gs.info('NowRFID demo seeded: ' + batches + ' batches, ' + items + ' items, ' + promoted + ' promoted')
    return { batches, items, promoted }
}

/**
 * Removes the demo: batches (items cascade), their tags and the assets the demo created.
 * Assets that already existed (paired plaquetas) are kept; only their tag link goes away.
 * Patrimônio numbers already issued are not reused.
 */
export function removeDemoData(): { batches: number; assets: number; tags: number } {
    let assets = 0
    let tags = 0
    const items = new GlideRecord(ITEM_TABLE)
    items.addQuery('batch.device_id', DEMO_DEVICE)
    items.query()
    while (items.next()) {
        const tag = new GlideRecord(TAG_TABLE)
        tag.addQuery('source_item', items.getUniqueValue())
        tag.query()
        while (tag.next()) {
            tag.deleteRecord()
            tags++
        }
        if (items.getValue('match_status') === 'created' && items.getValue('promoted_asset')) {
            const asset = new GlideRecord('alm_asset')
            if (asset.get(items.getValue('promoted_asset'))) {
                asset.deleteRecord()
                assets++
            }
        }
    }
    let batches = 0
    const gr = new GlideRecord(BATCH_TABLE)
    gr.addQuery('device_id', DEMO_DEVICE)
    gr.query()
    while (gr.next()) {
        gr.deleteRecord()
        batches++
    }
    gs.info('NowRFID demo removed: ' + batches + ' batches, ' + assets + ' assets, ' + tags + ' tags')
    return { batches, assets, tags }
}

export function seedDemoAction() {
    const r = seedDemoData()
    if (r.skipped) gs.addInfoMessage('NowRFID: ' + r.skipped + '. Remova-a antes de gerar de novo.')
    else gs.addInfoMessage('NowRFID: massa de demonstração criada — ' + r.batches + ' lotes, ' + r.items + ' itens, ' + r.promoted + ' ativos criados/vinculados')
}

export function removeDemoAction() {
    const r = removeDemoData()
    gs.addInfoMessage('NowRFID: massa de demonstração removida — ' + r.batches + ' lotes, ' + r.assets + ' ativos, ' + r.tags + ' etiquetas')
}
