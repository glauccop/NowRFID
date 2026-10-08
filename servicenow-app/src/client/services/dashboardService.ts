const BASE = '/api/x_snc_nowrfid/nowrfid'

export interface LocationNode {
    sys_id: string
    name: string
    type: string
    parent: string
    full_name: string
    active: boolean
}

export interface DashboardData {
    generated_at: string
    kpis: Record<string, number>
    by_type: { sys_id: string; name: string; icon: string; count: number }[]
    by_capture: { capture_type: string; operation: string; count: number }[]
    per_day: { date: string; count: number }[]
    root: string
    locations: LocationNode[]
    location_counts: { items: Record<string, number>; pending: Record<string, number>; classified: Record<string, number> }
    stockrooms: { sys_id: string; name: string; location: string; location_name: string }[]
    stockroom_counts: { items: Record<string, number>; pending: Record<string, number>; classified: Record<string, number> }
    recent_batches: { sys_id: string; number: string; status: string; item_count: number; location: string; notes: string; created: string }[]
    error_batches: DashboardData['recent_batches']
}

export interface PromoteResult {
    promoted: number
    failed: { item: string; message: string }[]
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(BASE + path, {
        ...init,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-UserToken': (window as any).g_ck,
            ...(init.headers || {}),
        },
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(body?.error?.message || body?.result?.error || `Falha ${response.status}`)
    }
    return (body.result ?? body) as T
}

export const dashboardService = {
    load: () => request<DashboardData>('/dashboard'),
    promote: (locations: string[], items: string[]) =>
        request<PromoteResult>('/dashboard/promote', { method: 'POST', body: JSON.stringify({ locations, items }) }),
}
