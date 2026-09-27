import React from 'react'

export default function Section({
    title,
    hint,
    children,
}: {
    title: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <section className="rf-section" aria-label={title}>
            <h2 className="rf-section__title">{title}</h2>
            {hint && <p className="rf-section__hint">{hint}</p>}
            {children}
        </section>
    )
}
