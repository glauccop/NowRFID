import { gs, GlideRecord } from '@servicenow/glide'

const COUNTER_TABLE = 'x_snc_nowrfid_counter'
const COUNTER_NAME = 'asset_tag'
/** First número de patrimônio issued by NowRFID when the counter does not exist yet (TJDFT max on 30/09/2026: 323497). */
export const ASSET_TAG_START_PROPERTY = 'x_snc_nowrfid.asset_tag_start'
const DEFAULT_START = '323498'
const DEFAULT_DIGITS = 6
const MAX_ATTEMPTS = 1000

function pad(value: number, digits: number): string {
    let s = String(value)
    while (s.length < digits) s = '0' + s
    return s
}

export function assetTagTaken(assetTag: string): boolean {
    const gr = new GlideRecord('alm_asset')
    gr.addQuery('asset_tag', assetTag)
    gr.setLimit(1)
    gr.query()
    return gr.hasNext()
}

function counterRecord(): GlideRecord {
    const gr = new GlideRecord(COUNTER_TABLE)
    gr.addQuery('name', COUNTER_NAME)
    gr.query()
    if (gr.next()) return gr
    gr.initialize()
    gr.setValue('name', COUNTER_NAME)
    gr.setValue('next_value', parseInt(gs.getProperty(ASSET_TAG_START_PROPERTY, DEFAULT_START), 10))
    gr.setValue('digits', DEFAULT_DIGITS)
    gr.insert()
    return gr
}

/**
 * Next número de patrimônio. ServiceNow is the only issuer. The counter only advances if it still
 * holds the value just read (narrows the race between concurrent promotions), and numbers already
 * used by any asset are skipped.
 */
export function nextAssetTag(): string {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const current = counterRecord()
        const value = parseInt(current.getValue('next_value'), 10)
        const digits = parseInt(current.getValue('digits') || String(DEFAULT_DIGITS), 10)
        const claim = new GlideRecord(COUNTER_TABLE)
        claim.addQuery('sys_id', current.getUniqueValue())
        claim.addQuery('next_value', value)
        claim.query()
        if (!claim.next()) continue
        claim.setValue('next_value', value + 1)
        if (!claim.update()) continue
        const tag = pad(value, digits)
        if (!assetTagTaken(tag)) return tag
    }
    throw new Error('NowRFID: não foi possível reservar um número de patrimônio')
}
