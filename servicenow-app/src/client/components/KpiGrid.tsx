import React from 'react'

interface Kpi {
    label: string
    value: number
    sub?: string
    accent: string
}

export default function KpiGrid({ kpis }: { kpis: Record<string, number> }) {
    const cards: Kpi[] = [
        { label: 'Lotes hoje', value: kpis.batches_today, sub: `${kpis.batches_7d} nos últimos 7 dias`, accent: 'var(--rf-primary)' },
        { label: 'Itens (7 dias)', value: kpis.items_7d, sub: `${kpis.items_total} no total`, accent: 'var(--rf-dv-0)' },
        { label: 'Pendentes', value: kpis.pending, sub: 'aguardando tipo de bem', accent: 'var(--rf-high)' },
        { label: 'Classificados', value: kpis.classified, sub: 'prontos para criar ativos', accent: 'var(--rf-moderate)' },
        { label: 'Ativos criados', value: kpis.promoted, sub: 'promovidos ao EAM', accent: 'var(--rf-positive)' },
        { label: 'Etiquetas ativas', value: kpis.tags_active, sub: 'EPC/TID vinculados', accent: 'var(--rf-green)' },
        { label: 'Lotes com erro', value: kpis.batches_error, sub: 'verificar qualidade', accent: 'var(--rf-critical)' },
    ]
    return (
        <div className="rf-kpis">
            {cards.map(card => (
                <div
                    key={card.label}
                    className="rf-kpi"
                    style={{ ['--rf-kpi-accent' as any]: card.accent }}
                    role="group"
                    aria-label={`${card.label}: ${card.value}`}
                >
                    <div className="rf-kpi__label">{card.label}</div>
                    <div className="rf-kpi__value">{(card.value ?? 0).toLocaleString('pt-BR')}</div>
                    {card.sub && <div className="rf-kpi__sub">{card.sub}</div>}
                </div>
            ))}
        </div>
    )
}
