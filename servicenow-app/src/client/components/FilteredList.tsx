import React, { useEffect, useRef } from 'react'
import {
    NowRecordListConnected,
    NowRecordListConnectedSelectedRecordCountUpdated,
} from '@servicenow/react-components/NowRecordListConnected'

interface Props {
    table: string
    title: string
    columns: string
    query: string
    limit?: number
    onSelection?: (sysIds: string[]) => void
}

/**
 * NowRecordListConnected has no query prop in this wrapper version, so the encoded query is
 * pushed to the underlying <now-record-list-connected> element (fixedQuery) and the list is
 * re-mounted whenever the query changes.
 */
export default function FilteredList({ table, title, columns, query, limit = 20, onSelection }: Props) {
    const host = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = host.current?.querySelector('now-record-list-connected') as any
        if (el) el.fixedQuery = query
    }, [query])

    const handleSelection: NowRecordListConnectedSelectedRecordCountUpdated = e => {
        onSelection?.(e.detail.payload.selectedRecords || [])
    }

    return (
        <div ref={host}>
            <NowRecordListConnected
                key={`${table}:${query}`}
                table={table}
                listTitle={title}
                columns={columns}
                limit={limit}
                hideHeader
                {...({ fixedQuery: query } as any)}
                onSelectedRecordCountUpdated={handleSelection}
            />
        </div>
    )
}
