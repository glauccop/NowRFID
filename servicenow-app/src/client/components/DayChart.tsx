import React from 'react'
import { DashboardData } from '../services/dashboardService.ts'

const W = 700
const H = 180
const PAD = { top: 18, bottom: 26, side: 8 }

interface Props {
    data: DashboardData['per_day']
    selected: string
    onSelect: (day: string) => void
}

export default function DayChart({ data, selected, onSelect }: Props) {
    const max = Math.max(...data.map(d => d.count), 1)
    const slot = (W - PAD.side * 2) / Math.max(data.length, 1)
    const barW = Math.min(34, slot * 0.62)
    const plotH = H - PAD.top - PAD.bottom
    const total = data.reduce((sum, d) => sum + d.count, 0)
    return (
        <svg className="rf-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Capturas por dia nos últimos ${data.length} dias: ${total} itens`}>
            <defs>
                <linearGradient id="rf-bar-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(79, 82, 189)" />
                    <stop offset="100%" stopColor="rgb(10, 184, 217)" />
                </linearGradient>
            </defs>
            <line x1={PAD.side} x2={W - PAD.side} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="rgb(228, 230, 234)" />
            {data.map((d, i) => {
                const h = (d.count / max) * plotH
                const x = PAD.side + i * slot + (slot - barW) / 2
                const y = H - PAD.bottom - h
                const [, month, day] = d.date.split('-')
                return (
                    <g
                        key={d.date}
                        className={`rf-chart__day${selected === d.date ? ' rf-chart__day--selected' : ''}${selected && selected !== d.date ? ' rf-chart__day--dim' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected === d.date}
                        aria-label={`${day}/${month}: ${d.count} itens`}
                        onClick={() => onSelect(d.date)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onSelect(d.date)
                            }
                        }}
                    >
                        <rect className="rf-chart__hit" x={PAD.side + i * slot} y={0} width={slot} height={H} fill="transparent" />
                        <rect x={x} y={y} width={barW} height={Math.max(h, d.count ? 2 : 0)} rx={4} fill="url(#rf-bar-grad)" />
                        {d.count > 0 && (
                            <text className="rf-chart__value" x={x + barW / 2} y={y - 4} textAnchor="middle">
                                {d.count}
                            </text>
                        )}
                        <text className="rf-chart__label" x={x + barW / 2} y={H - 8} textAnchor="middle">
                            {`${day}/${month}`}
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}
