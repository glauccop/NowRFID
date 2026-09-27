import { Table, StringColumn, ChoiceColumn, ReferenceColumn, DateTimeColumn } from '@servicenow/sdk/core'

// Registry linking a physical RFID tag (EPC/TID) to the asset it identifies.
export const x_snc_nowrfid_tag = Table({
    name: 'x_snc_nowrfid_tag',
    label: 'Etiqueta RFID',
    display: 'epc',
    allowWebServiceAccess: true,
    index: [
        { name: 'epc_idx', unique: false, element: 'epc' },
        { name: 'tid_idx', unique: false, element: 'tid' },
    ],
    schema: {
        epc: StringColumn({ label: 'EPC', maxLength: 128, mandatory: true }),
        tid: StringColumn({ label: 'TID', maxLength: 128 }),
        asset: ReferenceColumn({ label: 'Ativo', referenceTable: 'alm_asset' }),
        asset_type: ReferenceColumn({ label: 'Tipo de bem', referenceTable: 'x_snc_nowrfid_asset_type' }),
        location: ReferenceColumn({ label: 'Local', referenceTable: 'cmn_location' }),
        status: ChoiceColumn({
            label: 'Status',
            dropdown: 'dropdown_without_none',
            default: 'active',
            choices: {
                active: { label: 'Ativa', sequence: 10 },
                replaced: { label: 'Substituída', sequence: 20 },
                killed: { label: 'Destruída', sequence: 30 },
                orphan: { label: 'Sem ativo', sequence: 40 },
            },
        }),
        written_at: DateTimeColumn({ label: 'Gravada/registrada em' }),
        source_item: ReferenceColumn({ label: 'Item de origem', referenceTable: 'x_snc_nowrfid_scan_item' }),
    },
})
