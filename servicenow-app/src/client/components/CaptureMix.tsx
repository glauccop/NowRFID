import React from 'react'
import { DashboardData } from '../services/dashboardService.ts'

const LABELS: Record<string, string> = { rfid: 'RFID', barcode: 'Código de barras', qr: 'QR Code' }
const OPS: Record<string, string> = { read: 'lido', write: 'gravado' }
const COLORS: Record<string, string> = { rfid: 'var(--rf-primary)', barcode: 'var(--rf-dv-1)', qr: 'var(--rf-dv-4)' }

interface Props {
    data: DashboardData['by_capture']
    selected: string
    onSelect: (key: string) => void
}

export default function CaptureMix({ data, selected, onSelect }: Props) {
    if (!data.length) return null
    const rows = [...data].sort((a, b) => b.count - a.count)
    return (
        <div className="rf-chips" aria-label="Itens por forma de captura">
            {rows.map(row => {
                const key = `${row.capture_type}|${row.operation}`
                return (
                <button
                    type="button"
                    className={`rf-chip rf-chip--button${selected === key ? ' rf-chip--selected' : ''}`}
                    key={key}
                    onClick={() => onSelect(key)}
                    aria-pressed={selected === key}
                >
                    <span className="rf-chip__dot" style={{ background: COLORS[row.capture_type] || 'var(--rf-divider)' }} />
                    {LABELS[row.capture_type] || row.capture_type} · {OPS[row.operation] || row.operation}
                    <strong>{row.count}</strong>
                </button>
                )
            })}
        </div>
    )
}
