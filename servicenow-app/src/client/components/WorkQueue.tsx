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

interface Props {
    scopeIds: string[]
    scopeLabel: string
    onChanged: () => void
}

export default function WorkQueue({ scopeIds, scopeLabel, onChanged }: Props) {
    const [status, setStatus] = useState('open')
    const [selected, setSelected] = useState<string[]>([])
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<{ status: 'positive' | 'critical' | 'warning'; text: string } | null>(null)

    const statusQuery = STATUS.find(s => s.id === status)?.query || ''
    const scopeQuery = scopeIds.length ? `locationIN${scopeIds.join(',')}` : ''
    const query = [statusQuery, scopeQuery].filter(Boolean).join('^') + '^ORDERBYDESCsys_created_on'

    const onStatus: SelectSelectedItemSet = e => setStatus(String(e.detail.payload.value))

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
                <Select label="Situação" items={STATUS} selectedItem={status} onSelectedItemSet={onStatus} size="sm" />
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
            {message && <Alert status={message.status} content={message.text} />}
            <FilteredList
                table="x_snc_nowrfid_scan_item"
                title="Fila de trabalho"
                columns="asset_type,classification_status,capture_type,operation,epc,barcode_value,location,batch,sys_created_on"
                query={query}
                onSelection={setSelected}
            />
        </div>
    )
}
