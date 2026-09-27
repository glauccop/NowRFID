import { Table, StringColumn, IntegerColumn, BooleanColumn, ReferenceColumn } from '@servicenow/sdk/core'

// "Tipo de bem" chosen in the Android app before scanning (Cadeira, Monitor, ...).
export const x_snc_nowrfid_asset_type = Table({
    name: 'x_snc_nowrfid_asset_type',
    label: 'Tipo de bem',
    display: 'name',
    allowWebServiceAccess: true,
    schema: {
        name: StringColumn({ label: 'Nome', maxLength: 80, mandatory: true }),
        icon: StringColumn({ label: 'Ícone', maxLength: 16 }),
        order: IntegerColumn({ label: 'Ordem', default: '100' }),
        active: BooleanColumn({ label: 'Ativo', default: 'true' }),
        model_category: ReferenceColumn({ label: 'Categoria de modelo', referenceTable: 'cmdb_model_category' }),
        default_model: ReferenceColumn({ label: 'Modelo padrão', referenceTable: 'cmdb_model' }),
        asset_class: StringColumn({ label: 'Classe do ativo (tabela)', maxLength: 80, default: 'alm_asset' }),
    },
})
