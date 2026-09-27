import { gs, GlideAggregate, GlideDateTime, GlideRecord } from '@servicenow/glide'
import { getStructure, glideUtcToIso } from './structure-service.ts'
import { promoteItem } from './promote-service.ts'

const ITEM = 'x_snc_nowrfid_scan_item'
const BATCH = 'x_snc_nowrfid_scan_batch'
const TAG = 'x_snc_nowrfid_tag'
const TYPE = 'x_snc_nowrfid_asset_type'
const DAYS = 14
const PROMOTE_LIMIT = 500
const PER_DAY_SCAN_LIMIT = 20000

function count(table: string, query: string): number {
    const ga = new GlideAggregate(table)
    if (query) ga.addEncodedQuery(query)
    ga.addAggregate('COUNT', null as any)
    ga.query()
    return ga.next() ? parseInt(ga.getAggregate('COUNT', null as any), 10) || 0 : 0
}

/** COUNT grouped by one or two fields; key is "a" or "a|b". */
function countBy(table: string, query: string, fields: string[]): { [key: string]: number } {
    const ga = new GlideAggregate(table)
    if (query) ga.addEncodedQuery(query)
    fields.forEach(f => ga.groupBy(f as any))
    ga.addAggregate('COUNT', null as any)
    ga.query()
    const out: { [key: string]: number } = {}
    while (ga.next()) {
        const key = fields.map(f => ga.getValue(f as any) || '').join('|')
        out[key] = parseInt(ga.getAggregate('COUNT', null as any), 10) || 0
    }
    return out
}

function assetTypes(): { [id: string]: { name: string; icon: string; order: number } } {
    const out: { [id: string]: { name: string; icon: string; order: number } } = {}
    const gr = new GlideRecord(TYPE)
    gr.query()
    while (gr.next()) {
        out[gr.getUniqueValue()] = {
            name: gr.getValue('name') || '',
            icon: gr.getValue('icon') || '',
            order: parseInt(gr.getValue('order') || '0', 10),
        }
    }
    return out
}

/** Items per UTC day for the last DAYS days (oldest first, zero-filled). */
function perDay(): { date: string; count: number }[] {
    const buckets: { [day: string]: number } = {}
    const days: string[] = []
    for (let i = DAYS - 1; i >= 0; i--) {
        const d = new GlideDateTime()
        d.addDaysUTC(-i)
        const day = d.getValue().substring(0, 10)
        days.push(day)
        buckets[day] = 0
    }
    const gr = new GlideRecord(ITEM)
    gr.addEncodedQuery('sys_created_on>=' + days[0] + ' 00:00:00')
    gr.setLimit(PER_DAY_SCAN_LIMIT)
    gr.query()
    while (gr.next()) {
        const day = (gr.getValue('sys_created_on') || '').substring(0, 10)
        if (buckets[day] !== undefined) buckets[day]++
    }
    return days.map(day => ({ date: day, count: buckets[day] }))
}

function recentBatches(query: string, limit: number) {
    const out: any[] = []
    const gr = new GlideRecord(BATCH)
    if (query) gr.addEncodedQuery(query)
    gr.orderByDesc('sys_created_on')
    gr.setLimit(limit)
    gr.query()
    while (gr.next()) {
        out.push({
            sys_id: gr.getUniqueValue(),
            number: gr.getValue('number') || '',
            status: gr.getValue('status') || '',
            item_count: parseInt(gr.getValue('item_count') || '0', 10),
            location: gr.getDisplayValue('location') || '',
            notes: gr.getValue('notes') || '',
            created: glideUtcToIso(gr.getValue('sys_created_on') || ''),
        })
    }
    return out
}

export function getDashboard(): { status: number; body: any } {
    const types = assetTypes()
    const byTypeRaw = countBy(ITEM, '', ['asset_type'])
    const byType = Object.keys(byTypeRaw)
        .map(id => ({
            sys_id: id,
            name: id ? (types[id] ? types[id].name : 'Tipo removido') : 'Sem tipo (classificar)',
            icon: id ? (types[id] ? types[id].icon : '') : '❔',
            count: byTypeRaw[id],
        }))
        .sort((a, b) => b.count - a.count)

    const byCaptureRaw = countBy(ITEM, '', ['capture_type', 'operation'])
    const byCapture = Object.keys(byCaptureRaw).map(key => {
        const parts = key.split('|')
        return { capture_type: parts[0], operation: parts[1], count: byCaptureRaw[key] }
    })

    const structure = getStructure()
    const itemsByLocation = countBy(ITEM, 'locationISNOTEMPTY', ['location'])
    const pendingByLocation = countBy(ITEM, 'locationISNOTEMPTY^classification_status=pending', ['location'])
    const classifiedByLocation = countBy(ITEM, 'locationISNOTEMPTY^classification_status=classified', ['location'])

    return {
        status: 200,
        body: {
            generated_at: glideUtcToIso(new GlideDateTime().getValue()),
            kpis: {
                batches_today: count(BATCH, 'sys_created_on>=javascript:gs.beginningOfToday()'),
                batches_7d: count(BATCH, 'sys_created_on>=javascript:gs.daysAgoStart(6)'),
                items_7d: count(ITEM, 'sys_created_on>=javascript:gs.daysAgoStart(6)'),
                items_total: count(ITEM, ''),
                pending: count(ITEM, 'classification_status=pending'),
                classified: count(ITEM, 'classification_status=classified'),
                promoted: count(ITEM, 'classification_status=promoted'),
                tags_active: count(TAG, 'status=active'),
                batches_error: count(BATCH, 'status=error'),
                orphan_tags: count(TAG, 'status=orphan^ORassetISEMPTY'),
                items_without_location: count(ITEM, 'locationISEMPTY'),
            },
            by_type: byType,
            by_capture: byCapture,
            per_day: perDay(),
            locations: structure.status === 200 ? structure.body.locations : [],
            root: structure.status === 200 ? structure.body.root : '',
            location_counts: { items: itemsByLocation, pending: pendingByLocation, classified: classifiedByLocation },
            recent_batches: recentBatches('', 8),
            error_batches: recentBatches('status=error', 5),
        },
    }
}

/** Promotes classified items: the selected ones if given, else all in the given rooms (or everywhere). */
export function promoteClassified(locationIds: string[], itemIds: string[] = []): { promoted: number; failed: { item: string; message: string }[] } {
    const failed: { item: string; message: string }[] = []
    let promoted = 0
    const gr = new GlideRecord(ITEM)
    gr.addQuery('classification_status', 'classified')
    if (itemIds.length) gr.addQuery('sys_id', 'IN', itemIds.join(','))
    else if (locationIds.length) gr.addQuery('location', 'IN', locationIds.join(','))
    gr.orderBy('sys_created_on')
    gr.setLimit(PROMOTE_LIMIT)
    gr.query()
    while (gr.next()) {
        const result = promoteItem(gr)
        if (result.ok) promoted++
        else failed.push({ item: gr.getUniqueValue(), message: result.message })
    }
    gs.info('NowRFID dashboard promote: ' + promoted + ' promoted, ' + failed.length + ' failed')
    return { promoted, failed }
}
