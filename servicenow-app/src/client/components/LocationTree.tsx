import React, { useState } from 'react'
import { TreeIndex, typeLabel } from '../utils/tree.ts'

interface Props {
    index: TreeIndex
    rootId: string
    selected: string
    onSelect: (id: string) => void
}

function Caret({ open }: { open: boolean }) {
    return (
        <svg className={`rf-tree__caret${open ? ' rf-tree__caret--open' : ''}`} viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5z" />
        </svg>
    )
}

function Node({ id, depth, ...props }: Props & { id: string; depth: number }) {
    const { index, selected, onSelect } = props
    const node = index.byId[id]
    const kids = index.children[id] || []
    const [open, setOpen] = useState(depth < 2)
    if (!node) return null
    const t = index.totals[id] || { items: 0, pending: 0, classified: 0 }
    const toggle = () => {
        if (kids.length) setOpen(o => !o)
        onSelect(id)
    }
    return (
        <li>
            <button
                type="button"
                className={`rf-tree__row${selected === id ? ' rf-tree__row--selected' : ''}`}
                onClick={toggle}
                aria-expanded={kids.length ? open : undefined}
                aria-current={selected === id ? 'true' : undefined}
            >
                {kids.length ? <Caret open={open} /> : <span style={{ width: '1rem' }} />}
                <span>{node.name}</span>
                <span className="rf-tree__type">{typeLabel(node.type)}</span>
                <span className="rf-tree__counts">
                    {t.items > 0 && <span className="rf-pill rf-pill--items" title="Itens">{t.items}</span>}
                    {t.pending > 0 && <span className="rf-pill rf-pill--pending" title="Pendentes">{t.pending}</span>}
                    {t.classified > 0 && <span className="rf-pill rf-pill--classified" title="Classificados">{t.classified}</span>}
                </span>
            </button>
            {open && kids.length > 0 && (
                <ul className="rf-tree">
                    {kids.map(k => (
                        <Node key={k.sys_id} id={k.sys_id} depth={depth + 1} {...props} />
                    ))}
                </ul>
            )}
        </li>
    )
}

export default function LocationTree(props: Props) {
    if (!props.index.byId[props.rootId]) {
        return <div className="rf-empty">Estrutura de locais não configurada (propriedade x_snc_nowrfid.location_root).</div>
    }
    return (
        <ul className="rf-tree" aria-label="Estrutura de locais">
            <Node id={props.rootId} depth={0} {...props} />
        </ul>
    )
}
