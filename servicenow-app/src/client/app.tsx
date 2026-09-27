import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from '@servicenow/react-components/Alert'
import { Button } from '@servicenow/react-components/Button'
import Header from './components/Header.tsx'
import Section from './components/Section.tsx'
import KpiGrid from './components/KpiGrid.tsx'
import TypeBars from './components/TypeBars.tsx'
import CaptureMix from './components/CaptureMix.tsx'
import DayChart from './components/DayChart.tsx'
import LocationTree from './components/LocationTree.tsx'
import WorkQueue from './components/WorkQueue.tsx'
import Quality from './components/Quality.tsx'
import { dashboardService, DashboardData } from './services/dashboardService.ts'
import { buildIndex, descendants } from './utils/tree.ts'

const roomFromUrl = () => new URLSearchParams(window.location.search).get('room') || ''

function setRoomInUrl(room: string, title: string) {
    const params = new URLSearchParams(window.location.search)
    if (room) params.set('room', room)
    else params.delete('room')
    const path = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
    if (window.self !== window.top) {
        ;(window as any).CustomEvent?.fireTop?.('magellanNavigator.permalink.set', { relativePath: path, title })
    }
    window.history.pushState({ room }, '', path)
    document.title = title
}

export default function App() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [error, setError] = useState('')
    const [room, setRoom] = useState(roomFromUrl)

    const load = useCallback(() => {
        setError('')
        dashboardService.load().then(setData).catch(e => setError(e instanceof Error ? e.message : String(e)))
    }, [])

    useEffect(() => {
        load()
        const onPop = () => setRoom(roomFromUrl())
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [load])

    const index = useMemo(() => (data ? buildIndex(data) : null), [data])
    const selectedNode = index && room ? index.byId[room] : undefined
    const scopeIds = index && selectedNode ? descendants(index, room) : []

    const select = (id: string) => {
        const next = id === room || (data && id === data.root) ? '' : id
        const name = next && index ? index.byId[next]?.name : ''
        setRoom(next)
        setRoomInUrl(next, name ? `NowRFID — ${name}` : 'NowRFID — Painel')
    }

    return (
        <div className="rf-page">
            <Header updatedAt={data?.generated_at} />
            <main className="rf-main">
                {error && (
                    <Alert status="critical" header="Não foi possível carregar o painel" content={error} />
                )}
                {!data && !error && (
                    <div className="rf-kpis" aria-busy="true" aria-label="Carregando">
                        {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="rf-skeleton" />)}
                    </div>
                )}
                {data && index && (
                    <>
                        <Section title="Visão geral" hint="Capturas recebidas do app NowRFID e o que falta para virar ativo no EAM.">
                            <KpiGrid kpis={data.kpis} />
                        </Section>
                        <div className="rf-grid-2">
                            <Section title="Onde" hint="Clique num prédio, andar ou sala para filtrar a fila de trabalho.">
                                <div className="rf-panel">
                                    <LocationTree index={index} rootId={data.root} selected={room} onSelect={select} />
                                </div>
                            </Section>
                            <Section title="O quê">
                                <div className="rf-panel">
                                    <TypeBars data={data.by_type} />
                                    <div style={{ marginTop: '1rem' }}><CaptureMix data={data.by_capture} /></div>
                                </div>
                            </Section>
                        </div>
                        <Section title="Quando" hint="Itens recebidos por dia (UTC), últimos 14 dias.">
                            <div className="rf-panel"><DayChart data={data.per_day} /></div>
                        </Section>
                        <Section title="Fila de trabalho" hint="Defina o tipo de bem direto na lista (edição inline) e crie os ativos.">
                            <WorkQueue scopeIds={scopeIds} scopeLabel={selectedNode ? selectedNode.name : 'todos os locais'} onChanged={load} />
                        </Section>
                        <Section title="Qualidade">
                            <Quality kpis={data.kpis} />
                        </Section>
                        <div><Button label="Atualizar painel" variant="secondary" icon="arrow-clockwise-outline" onClicked={load} /></div>
                    </>
                )}
            </main>
            <footer className="rf-footer">NowRFID · leitor Chainway R6 · Horizon Design System</footer>
        </div>
    )
}
