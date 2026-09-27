import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'
import { isoToGlideUtc } from './batch-service.ts'

export const LOCATION_ROOT_PROPERTY = 'x_snc_nowrfid.location_root'

export interface LocationNode {
    sys_id: string
    name: string
    type: string
    parent: string
    full_name: string
    active: boolean
}

/** "yyyy-MM-dd HH:mm:ss" (UTC) -> ISO8601 with Z. */
export function glideUtcToIso(value: string): string {
    return value ? value.replace(' ', 'T') + 'Z' : ''
}

function toNode(gr: GlideRecord, rootId: string): LocationNode {
    const id = gr.getUniqueValue()
    return {
        sys_id: id,
        name: gr.getValue('name') || '',
        type: gr.getValue('cmn_location_type') || '',
        parent: id === rootId ? '' : gr.getValue('parent') || '',
        full_name: gr.getValue('full_name') || gr.getValue('name') || '',
        active: gr.getValue('active') !== '0' && gr.getValue('active') !== 'false',
    }
}

/**
 * Root location and all its descendants (walked level by level through `parent`).
 * With `sinceIso`, only nodes updated after that instant are returned (inactive ones included).
 */
export function getStructure(sinceIso?: string): { status: number; body: any } {
    const rootId = gs.getProperty(LOCATION_ROOT_PROPERTY, '')
    const serverTime = glideUtcToIso(new GlideDateTime().getValue())
    if (!rootId) {
        return { status: 500, body: { error: 'Property ' + LOCATION_ROOT_PROPERTY + ' is not configured' } }
    }
    const root = new GlideRecord('cmn_location')
    if (!root.get(rootId)) {
        return { status: 500, body: { error: 'Root location ' + rootId + ' not found' } }
    }

    const since = sinceIso ? isoToGlideUtc(sinceIso) : ''
    if (sinceIso && !since) {
        return { status: 400, body: { error: 'Invalid since (expected ISO8601)' } }
    }

    const nodes: LocationNode[] = []
    const include = (gr: GlideRecord) => {
        if (!since || (gr.getValue('sys_updated_on') || '') > since) {
            nodes.push(toNode(gr, rootId))
        }
    }
    include(root)

    let frontier = [rootId]
    const seen: { [id: string]: boolean } = {}
    seen[rootId] = true
    // Guard against cycles and absurd depth.
    for (let depth = 0; depth < 12 && frontier.length > 0; depth++) {
        const next: string[] = []
        const gr = new GlideRecord('cmn_location')
        gr.addQuery('parent', 'IN', frontier.join(','))
        gr.orderBy('name')
        gr.query()
        while (gr.next()) {
            const id = gr.getUniqueValue()
            if (seen[id]) continue
            seen[id] = true
            next.push(id)
            include(gr)
        }
        frontier = next
    }

    return { status: 200, body: { root: rootId, server_time: serverTime, locations: nodes } }
}

export function getAssetTypes(): { status: number; body: any } {
    const types: any[] = []
    const gr = new GlideRecord('x_snc_nowrfid_asset_type')
    gr.addQuery('active', true)
    gr.orderBy('order')
    gr.orderBy('name')
    gr.query()
    while (gr.next()) {
        types.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name') || '',
            icon: gr.getValue('icon') || '',
            order: parseInt(gr.getValue('order') || '0', 10),
            model_category: gr.getValue('model_category') || '',
            asset_class: gr.getValue('asset_class') || 'alm_asset',
        })
    }
    return { status: 200, body: { types } }
}
