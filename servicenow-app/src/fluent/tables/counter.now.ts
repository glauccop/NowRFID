import { Table, StringColumn, IntegerColumn } from '@servicenow/sdk/core'

// Sequential counters owned by NowRFID (one row per counter, e.g. "asset_tag" = next número de patrimônio).
export const x_snc_nowrfid_counter = Table({
    name: 'x_snc_nowrfid_counter',
    label: 'Contador NowRFID',
    display: 'name',
    index: [{ name: 'name_idx', unique: true, element: 'name' }],
    schema: {
        name: StringColumn({ label: 'Nome', maxLength: 40, mandatory: true }),
        next_value: IntegerColumn({ label: 'Próximo valor', mandatory: true }),
        digits: IntegerColumn({ label: 'Dígitos', default: '6' }),
    },
})
