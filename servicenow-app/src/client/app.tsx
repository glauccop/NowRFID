import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from '@servicenow/react-components/Alert'
import { Button } from '@servicenow/react-components/Button'
import Header from './components/Header.tsx'
import Section from './components/Section.tsx'
import KpiGrid from './components/KpiGrid.tsx'
import StockroomList from './components/StockroomList.tsx'
import TypeBars, { NO_TYPE } from './components/TypeBars.tsx'
import CaptureMix from './components/CaptureMix.tsx'
import DayChart from './components/DayChart.tsx'
import LocationTree from './components/LocationTree.tsx'
import WorkQueue, { QueueFilter } from './components/WorkQueue.tsx'
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
    const [stock, setStock] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [captureFilter, setCaptureFilter] = useState('')
    const [dayFilter, setDayFilter] = useState('')
    const [status, setStatus] = useState('open')

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

    const selectStock = (id: string) => {
        setStock(id === stock ? '' : id)
        if (room) {
            setRoom('')
            setRoomInUrl('', 'NowRFID — Painel')
        }
    }

    // Chart totals count every status, so the list must not hide promoted items behind "open".
    const toggle = (current: string, next: string, set: (v: string) => void) => {
        const value = current === next ? '' : next
        set(value)
        if (value && status === 'open') setStatus('all')
    }

    const select = (id: string) => {
        const next = id === room || (data && id === data.root) ? '' : id
        const name = next && index ? index.byId[next]?.name : ''
        if (next) setStock('')
        setRoom(next)
        setRoomInUrl(next, name ? `NowRFID — ${name}` : 'NowRFID — Painel')
    }

    const stockName = data?.stockrooms?.find(s => s.sys_id === stock)?.name || ''
    const typeName = typeFilter === NO_TYPE ? 'Sem tipo' : data?.by_type.find(t => t.sys_id === typeFilter)?.name || ''
    const [captureType, captureOp] = captureFilter.split('|')
    const CAPTURE = { rfid: 'RFID', barcode: 'Código de barras', qr: 'QR Code' } as Record<string, string>
    const OPS = { read: 'lido', write: 'gravado' } as Record<string, string>
    const dayLabel = dayFilter ? dayFilter.split('-').reverse().slice(0, 2).join('/') : ''

    const filters: QueueFilter[] = []
    if (typeFilter) {
        filters.push({
            id: 'type',
            label: `Tipo: ${typeName}`,
            query: typeFilter === NO_TYPE ? 'asset_typeISEMPTY' : `asset_type=${typeFilter}`,
            onClear: () => setTypeFilter(''),
        })
    }
    if (captureFilter) {
        filters.push({
            id: 'capture',
            label: `Captura: ${CAPTURE[captureType] || captureType} · ${OPS[captureOp] || captureOp}`,
            query: `capture_type=${captureType}^operation=${captureOp}`,
            onClear: () => setCaptureFilter(''),
        })
    }
    if (dayFilter) {
        filters.push({
            id: 'day',
            label: `Dia: ${dayLabel}`,
            query: `sys_created_on>=${dayFilter} 00:00:00^sys_created_on<=${dayFilter} 23:59:59`,
            onClear: () => setDayFilter(''),
        })
    }
    const scopeQuery = stock ? `stockroom=${stock}` : scopeIds.length ? `locationIN${scopeIds.join(',')}` : ''

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
                            <Section title="Onde" hint="Clique num prédio, andar, sala ou almoxarifado para filtrar a fila de trabalho.">
                                <div className="rf-panel">
                                    <LocationTree index={index} rootId={data.root} selected={room} onSelect={select} />
                                    <StockroomList data={data} selected={stock} onSelect={selectStock} />
                                </div>
                            </Section>
                            <Section title="O quê" hint="Clique num tipo ou forma de captura para filtrar a fila de trabalho.">
                                <div className="rf-panel">
                                    <TypeBars data={data.by_type} selected={typeFilter} onSelect={id => toggle(typeFilter, id, setTypeFilter)} />
                                    <div style={{ marginTop: '1rem' }}><CaptureMix data={data.by_capture} selected={captureFilter} onSelect={k => toggle(captureFilter, k, setCaptureFilter)} /></div>
                                </div>
                            </Section>
                        </div>
                        <Section title="Quando" hint="Itens recebidos por dia (UTC), últimos 14 dias. Clique num dia para filtrar a fila de trabalho.">
                            <div className="rf-panel"><DayChart data={data.per_day} selected={dayFilter} onSelect={d => toggle(dayFilter, d, setDayFilter)} /></div>
                        </Section>
                        <Section title="Fila de trabalho" hint="Defina o tipo de bem direto na lista (edição inline) e crie os ativos.">
                            <WorkQueue
                                scopeIds={scopeIds}
                                scopeLabel={stock ? stockName : selectedNode ? selectedNode.name : 'todos os locais'}
                                scopeQuery={scopeQuery}
                                filters={filters}
                                status={status}
                                onStatus={setStatus}
                                onChanged={load}
                            />
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
