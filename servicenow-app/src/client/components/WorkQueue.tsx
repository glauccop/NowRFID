import React, { useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Alert } from '@servicenow/react-components/Alert'
import { Select, SelectSelectedItemSet } from '@servicenow/react-components/Select'
import FilteredList from './FilteredList.tsx'
import { dashboardService } from '../services/dashboardService.ts'

const STATUS = [
    { id: 'open', label: 'Pendentes e classificados', query: 'classification_statusINpending,classified' },
    { id: 'pending', label: 'Só pendentes (sem tipo)', query: 'classification_status=pending' },
    { id: 'classified', label: 'Só classificados', query: 'classification_status=classified' },
    { id: 'all', label: 'Todos (inclui promovidos)', query: '' },
]

export interface QueueFilter {
    id: string
    label: string
    query: string
    onClear: () => void
}

interface Props {
    scopeIds: string[]
    scopeLabel: string
    /** Locations/stockroom scope is built by the parent; extra filters come from O quê / Quando. */
    scopeQuery: string
    filters: QueueFilter[]
    status: string
    onStatus: (status: string) => void
    onChanged: () => void
}

export default function WorkQueue({ scopeIds, scopeLabel, scopeQuery, filters, status, onStatus, onChanged }: Props) {
    const [selected, setSelected] = useState<string[]>([])
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<{ status: 'positive' | 'critical' | 'warning'; text: string } | null>(null)

    const statusQuery = STATUS.find(s => s.id === status)?.query || ''
    const query = [statusQuery, scopeQuery, ...filters.map(f => f.query)].filter(Boolean).join('^') + '^ORDERBYDESCsys_created_on'

    const onStatusSet: SelectSelectedItemSet = e => onStatus(String(e.detail.payload.value))

    const promote = async () => {
        setBusy(true)
        setMessage(null)
        try {
            const result = await dashboardService.promote(scopeIds, selected)
            const failed = result.failed.length
            setMessage({
                status: failed ? 'warning' : 'positive',
                text: `${result.promoted} ativo(s) criado(s)${failed ? `, ${failed} com problema: ${result.failed[0].message}` : ''}.`,
            })
            onChanged()
        } catch (e) {
            setMessage({ status: 'critical', text: e instanceof Error ? e.message : String(e) })
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="rf-panel">
            <div className="rf-queue__toolbar">
                <Select label="Situação" items={STATUS} selectedItem={status} onSelectedItemSet={onStatusSet} size="sm" />
                <span className="rf-queue__scope">Escopo: {scopeLabel}</span>
                <span className="rf-queue__spacer" />
                <Button
                    label={selected.length ? `Criar ativos (${selected.length} selecionados)` : 'Criar ativos (todos classificados)'}
                    variant="primary"
                    icon="plus-outline"
                    disabled={busy}
                    onClicked={promote}
                />
            </div>
            {filters.length > 0 && (
                <div className="rf-filters" aria-label="Filtros ativos">
                    {filters.map(f => (
                        <button key={f.id} type="button" className="rf-filters__chip" onClick={f.onClear} title="Remover filtro">
                            {f.label} <span aria-hidden="true">✕</span>
                        </button>
                    ))}
                </div>
            )}
            {message && <Alert status={message.status} content={message.text} />}
            <FilteredList
                table="x_snc_nowrfid_scan_item"
                title="Fila de trabalho"
                columns="sys_created_on,asset_type,classification_status,capture_type,operation,epc,barcode_value,location,stockroom,batch"
                query={query}
                onSelection={setSelected}
            />
        </div>
    )
}
