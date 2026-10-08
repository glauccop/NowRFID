import React from 'react'
import { DashboardData } from '../services/dashboardService.ts'

const PALETTE = ['--rf-dv-0', '--rf-dv-1', '--rf-dv-2', '--rf-dv-3', '--rf-dv-4', '--rf-dv-5']

export const NO_TYPE = '__none__'

interface Props {
    data: DashboardData['by_type']
    selected: string
    onSelect: (id: string) => void
}

export default function TypeBars({ data, selected, onSelect }: Props) {
    if (!data.length) return <div className="rf-empty">Nenhum item capturado ainda.</div>
    const max = Math.max(...data.map(d => d.count), 1)
    return (
        <div className="rf-bars" role="list" aria-label="Itens por tipo de bem">
            {data.map((row, i) => (
                <button
                    type="button"
                    className={`rf-bar rf-bar--button${selected === (row.sys_id || NO_TYPE) ? ' rf-bar--selected' : ''}`}
                    role="listitem"
                    key={row.sys_id || 'none'}
                    onClick={() => onSelect(row.sys_id || NO_TYPE)}
                    aria-pressed={selected === (row.sys_id || NO_TYPE)}
                >
                    <span className="rf-bar__label" title={row.name}>
                        {row.icon} {row.name}
                    </span>
                    <span className="rf-bar__track" aria-hidden="true">
                        <span
                            className="rf-bar__fill"
                            style={{
                                display: 'block',
                                width: `${(row.count / max) * 100}%`,
                                background: row.sys_id ? `var(${PALETTE[i % PALETTE.length]})` : 'var(--rf-high)',
                            }}
                        />
                    </span>
                    <span className="rf-bar__value">{row.count}</span>
                </button>
            ))}
        </div>
    )
}
