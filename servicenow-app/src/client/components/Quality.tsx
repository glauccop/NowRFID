import React from 'react'
import FilteredList from './FilteredList.tsx'

export default function Quality({ kpis }: { kpis: Record<string, number> }) {
    const tiles = [
        { label: 'Lotes com erro', value: kpis.batches_error },
        { label: 'Etiquetas órfãs', value: kpis.orphan_tags },
        { label: 'Itens sem local', value: kpis.items_without_location },
    ]
    return (
        <div className="rf-panel">
            <div className="rf-quality">
                {tiles.map(t => (
                    <div key={t.label} className={`rf-quality__item rf-quality__item--${t.value ? 'bad' : 'ok'}`}>
                        <div className="rf-quality__value">{t.value}</div>
                        <div>{t.label}</div>
                    </div>
                ))}
            </div>
            {kpis.batches_error > 0 && (
                <FilteredList
                    table="x_snc_nowrfid_scan_batch"
                    title="Lotes com erro"
                    columns="number,status,item_count,location,notes,sys_created_on"
                    query="status=error^ORDERBYDESCsys_created_on"
                    limit={5}
                />
            )}
        </div>
    )
}
