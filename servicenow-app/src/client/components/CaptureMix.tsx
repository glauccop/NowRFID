import React from 'react'
import { DashboardData } from '../services/dashboardService.ts'

const LABELS: Record<string, string> = { rfid: 'RFID', barcode: 'Código de barras', qr: 'QR Code' }
const OPS: Record<string, string> = { read: 'lido', write: 'gravado' }
const COLORS: Record<string, string> = { rfid: 'var(--rf-primary)', barcode: 'var(--rf-dv-1)', qr: 'var(--rf-dv-4)' }

export default function CaptureMix({ data }: { data: DashboardData['by_capture'] }) {
    if (!data.length) return null
    const rows = [...data].sort((a, b) => b.count - a.count)
    return (
        <div className="rf-chips" aria-label="Itens por forma de captura">
            {rows.map(row => (
                <span className="rf-chip" key={`${row.capture_type}-${row.operation}`}>
                    <span className="rf-chip__dot" style={{ background: COLORS[row.capture_type] || 'var(--rf-divider)' }} />
                    {LABELS[row.capture_type] || row.capture_type} · {OPS[row.operation] || row.operation}
                    <strong>{row.count}</strong>
                </span>
            ))}
        </div>
    )
}
