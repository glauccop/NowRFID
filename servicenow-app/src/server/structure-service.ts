import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'
import { isoToGlideUtc } from './batch-service.ts'
import { ensureAssetTypes, listAssetTypes } from './asset-type-service.ts'

/** Fixed root (legacy demo tree). When unset, the tree is built from entities (see getStructure). */
export const LOCATION_ROOT_PROPERTY = 'x_snc_nowrfid.location_root'
/** Regex on cmn_location.name that marks an entity (unidade). TJDFT: 11-digit code, e.g. "11302010000 - 1ª VARA ...". */
export const ENTITY_PATTERN_PROPERTY = 'x_snc_nowrfid.entity_pattern'
const DEFAULT_ENTITY_PATTERN = '^\\d{11} - '
/** Encoded query selecting the stockrooms offered as capture destination. */
export const STOCKROOM_QUERY_PROPERTY = 'x_snc_nowrfid.stockroom_query'
const DEFAULT_STOCKROOM_QUERY = 'nameSTARTSWITHALMOX'
const VIRTUAL_ROOT = 'nowrfid-root'
const MAX_DEPTH = 12

export interface LocationNode {
    sys_id: string
    name: string
    type: string
    parent: string
    full_name: string
    active: boolean
    /** 'entity' for unidades; empty otherwise. */
    kind: string
}

export interface StockroomNode {
    sys_id: string
    name: string
    location: string
    location_name: string
}

/** "yyyy-MM-dd HH:mm:ss" (UTC) -> ISO8601 with Z. */
export function glideUtcToIso(value: string): string {
    return value ? value.replace(' ', 'T') + 'Z' : ''
}

function toNode(gr: GlideRecord, rootId: string, kind = ''): LocationNode {
    const id = gr.getUniqueValue()
    return {
        sys_id: id,
        name: gr.getValue('name') || '',
        type: gr.getValue('cmn_location_type') || '',
        parent: id === rootId ? '' : gr.getValue('parent') || '',
        full_name: gr.getValue('full_name') || gr.getValue('name') || '',
        active: gr.getValue('active') !== '0' && gr.getValue('active') !== 'false',
        kind,
    }
}

/** Walks `parent` level by level from the given ids, calling `visit` for every descendant (cycle-safe). */
function walkDescendants(startIds: string[], visit: (gr: GlideRecord) => void) {
    const seen: { [id: string]: boolean } = {}
    startIds.forEach(id => (seen[id] = true))
    let frontier = startIds
    for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
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
            visit(gr)
        }
        frontier = next
    }
}

export function getStockrooms(): StockroomNode[] {
    const list: StockroomNode[] = []
    const gr = new GlideRecord('alm_stockroom')
    gr.addEncodedQuery(gs.getProperty(STOCKROOM_QUERY_PROPERTY, DEFAULT_STOCKROOM_QUERY))
    gr.orderBy('name')
    gr.query()
    while (gr.next()) {
        list.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name') || '',
            location: gr.getValue('location') || '',
            location_name: gr.getDisplayValue('location') || '',
        })
    }
    return list
}

/** Legacy mode: a fixed root and all its descendants, with optional delta (`since`). */
function fixedRootTree(rootId: string, since: string): { root: string; locations: LocationNode[] } | null {
    const root = new GlideRecord('cmn_location')
    if (!root.get(rootId)) return null
    const nodes: LocationNode[] = []
    const include = (gr: GlideRecord) => {
        if (!since || (gr.getValue('sys_updated_on') || '') > since) nodes.push(toNode(gr, rootId))
    }
    include(root)
    walkDescendants([rootId], include)
    return { root: rootId, locations: nodes }
}

/**
 * Entity mode: only entities that have rooms below them, their descendants, and the ancestors needed
 * to navigate to them. A room hanging directly under a city (no entity) is left out on purpose.
 * The root is the deepest ancestor shared by every entity.
 */
export function entityTree(): { root: string; locations: LocationNode[] } {
    const pattern = new RegExp(gs.getProperty(ENTITY_PATTERN_PROPERTY, DEFAULT_ENTITY_PATTERN))
    const entities: GlideRecord[] = []
    const gr = new GlideRecord('cmn_location')
    // Narrow the scan to names starting with a digit; the regex decides.
    gr.addEncodedQuery('nameSTARTSWITH0^ORnameSTARTSWITH1^ORnameSTARTSWITH2^ORnameSTARTSWITH3^ORnameSTARTSWITH4^ORnameSTARTSWITH5^ORnameSTARTSWITH6^ORnameSTARTSWITH7^ORnameSTARTSWITH8^ORnameSTARTSWITH9')
    gr.query()
    const entityIds: string[] = []
    while (gr.next()) {
        if (pattern.test(gr.getValue('name') || '')) entityIds.push(gr.getUniqueValue())
    }

    const byId: { [id: string]: LocationNode } = {}
    const childCount: { [id: string]: number } = {}
    walkDescendants(entityIds, d => {
        const node = toNode(d, '')
        byId[node.sys_id] = node
        childCount[node.parent] = (childCount[node.parent] || 0) + 1
    })
    const kept = entityIds.filter(id => childCount[id])

    // Ancestor chains (top -> entity) to find the common root.
    const chains: string[][] = []
    for (const id of kept) {
        const chain: string[] = []
        const loc = new GlideRecord('cmn_location')
        let cursor = id
        for (let i = 0; i < MAX_DEPTH && cursor && loc.get(cursor); i++) {
            chain.unshift(cursor)
            if (!byId[cursor]) byId[cursor] = toNode(loc, '', cursor === id ? 'entity' : '')
            cursor = loc.getValue('parent') || ''
        }
        byId[id].kind = 'entity'
        chains.push(chain)
    }

    let rootId = VIRTUAL_ROOT
    if (chains.length) {
        let common = 0
        while (chains.every(c => c[common] && c[common] === chains[0][common])) common++
        if (common > 0) rootId = chains[0][common - 1]
        // Never let an entity be the root: the operator must still pick it explicitly.
        if (kept.indexOf(rootId) >= 0) rootId = common > 1 ? chains[0][common - 2] : VIRTUAL_ROOT
    }

    const include: { [id: string]: boolean } = {}
    for (const chain of chains) {
        const start = rootId === VIRTUAL_ROOT ? 0 : chain.indexOf(rootId)
        chain.slice(start).forEach(id => (include[id] = true))
    }
    // Descendants of kept entities.
    const isUnderKept = (node: LocationNode): boolean => {
        let p = node.parent
        for (let i = 0; i < MAX_DEPTH && p; i++) {
            if (kept.indexOf(p) >= 0) return true
            p = byId[p] ? byId[p].parent : ''
        }
        return false
    }
    const locations: LocationNode[] = []
    if (rootId === VIRTUAL_ROOT) {
        locations.push({ sys_id: VIRTUAL_ROOT, name: 'Entidades', type: '', parent: '', full_name: 'Entidades', active: true, kind: '' })
    }
    for (const id in byId) {
        const node = byId[id]
        if (!include[id] && !isUnderKept(node)) continue
        if (id === rootId) node.parent = ''
        else if (rootId === VIRTUAL_ROOT && chains.some(c => c[0] === id)) node.parent = VIRTUAL_ROOT
        locations.push(node)
    }
    return { root: rootId, locations }
}

/**
 * Location tree for the app plus the stockrooms. Entity mode always answers in full (`full: true`);
 * the legacy fixed-root mode honours `since` for delta sync.
 */
export function getStructure(sinceIso?: string): { status: number; body: any } {
    const serverTime = glideUtcToIso(new GlideDateTime().getValue())
    const rootId = gs.getProperty(LOCATION_ROOT_PROPERTY, '')
    const stockrooms = getStockrooms()
    if (!rootId) {
        const tree = entityTree()
        return { status: 200, body: { root: tree.root, server_time: serverTime, full: true, locations: tree.locations, stockrooms } }
    }

    const since = sinceIso ? isoToGlideUtc(sinceIso) : ''
    if (sinceIso && !since) {
        return { status: 400, body: { error: 'Invalid since (expected ISO8601)' } }
    }
    const tree = fixedRootTree(rootId, since)
    if (!tree) {
        return { status: 500, body: { error: 'Root location ' + rootId + ' not found' } }
    }
    return { status: 200, body: { root: rootId, server_time: serverTime, full: !since, locations: tree.locations, stockrooms } }
}

/** Active asset types with SIAF data and models; generated from the categories on first use. */
export function getAssetTypes(): { status: number; body: any } {
    ensureAssetTypes()
    return { status: 200, body: { types: listAssetTypes() } }
}
