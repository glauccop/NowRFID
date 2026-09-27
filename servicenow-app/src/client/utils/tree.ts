import { DashboardData, LocationNode } from '../services/dashboardService.ts'

const TYPE_LABELS: Record<string, string> = {
    site: 'Localidade',
    campus: 'Campus',
    'building/structure': 'Prédio',
    floor: 'Andar',
    room: 'Sala',
}

export const typeLabel = (type: string) => TYPE_LABELS[type] || 'Local'

export interface TreeIndex {
    byId: Record<string, LocationNode>
    children: Record<string, LocationNode[]>
    totals: Record<string, { items: number; pending: number; classified: number }>
}

/** Children map plus counts rolled up from rooms to their ancestors. */
export function buildIndex(data: DashboardData): TreeIndex {
    const byId: TreeIndex['byId'] = {}
    const children: TreeIndex['children'] = {}
    data.locations.filter(l => l.active).forEach(l => (byId[l.sys_id] = l))
    Object.values(byId).forEach(l => {
        if (!l.parent || l.sys_id === data.root) return
        ;(children[l.parent] = children[l.parent] || []).push(l)
    })
    Object.values(children).forEach(list => list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true })))

    const totals: TreeIndex['totals'] = {}
    const add = (id: string, key: 'items' | 'pending' | 'classified', n: number) => {
        let cur: LocationNode | undefined = byId[id]
        const seen: Record<string, boolean> = {}
        while (cur && !seen[cur.sys_id]) {
            seen[cur.sys_id] = true
            const t = (totals[cur.sys_id] = totals[cur.sys_id] || { items: 0, pending: 0, classified: 0 })
            t[key] += n
            cur = cur.sys_id === data.root ? undefined : byId[cur.parent]
        }
    }
    ;(['items', 'pending', 'classified'] as const).forEach(key =>
        Object.entries(data.location_counts[key] || {}).forEach(([id, n]) => add(id, key, n)),
    )
    return { byId, children, totals }
}

/** The node itself and every descendant id (for scoping the work queue). */
export function descendants(index: TreeIndex, id: string): string[] {
    const out: string[] = []
    const stack = [id]
    while (stack.length) {
        const cur = stack.pop() as string
        out.push(cur)
        ;(index.children[cur] || []).forEach(c => stack.push(c.sys_id))
    }
    return out
}
