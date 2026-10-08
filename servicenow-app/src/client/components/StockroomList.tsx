import React from 'react'
import { DashboardData } from '../services/dashboardService.ts'

interface Props {
    data: DashboardData
    selected: string
    onSelect: (id: string) => void
}

export default function StockroomList({ data, selected, onSelect }: Props) {
    if (!data.stockrooms?.length) return null
    return (
        <div className="rf-stock">
            <h3 className="rf-stock__title">Almoxarifados</h3>
            <ul className="rf-tree" aria-label="Almoxarifados">
                {data.stockrooms.map(s => {
                    const items = data.stockroom_counts.items[s.sys_id] || 0
                    const pending = data.stockroom_counts.pending[s.sys_id] || 0
                    const classified = data.stockroom_counts.classified[s.sys_id] || 0
                    return (
                        <li key={s.sys_id}>
                            <button
                                type="button"
                                className={`rf-tree__row${selected === s.sys_id ? ' rf-tree__row--selected' : ''}`}
                                onClick={() => onSelect(s.sys_id)}
                                aria-current={selected === s.sys_id ? 'true' : undefined}
                            >
                                <span style={{ width: '1rem' }} />
                                <span>{s.name}</span>
                                <span className="rf-tree__type">Almoxarifado</span>
                                <span className="rf-tree__counts">
                                    {items > 0 && <span className="rf-pill rf-pill--items" title="Itens">{items}</span>}
                                    {pending > 0 && <span className="rf-pill rf-pill--pending" title="Pendentes">{pending}</span>}
                                    {classified > 0 && <span className="rf-pill rf-pill--classified" title="Classificados">{classified}</span>}
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
