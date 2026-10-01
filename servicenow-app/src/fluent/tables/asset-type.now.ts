import { Table, StringColumn, IntegerColumn, BooleanColumn, ReferenceColumn, ChoiceColumn } from '@servicenow/sdk/core'

// "Tipo de bem" chosen in the Android app before scanning (Cadeira, Monitor, ...).
// Rows with source=category are generated from cmdb_model_category by syncAssetTypes().
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
        siaf: ReferenceColumn({ label: 'Conta SIAF predominante', referenceTable: 'u_siaf_codigos' }),
        source: ChoiceColumn({
            label: 'Origem',
            dropdown: 'dropdown_without_none',
            default: 'manual',
            choices: {
                manual: { label: 'Manual', sequence: 10 },
                category: { label: 'Categoria (sincronizada)', sequence: 20 },
            },
        }),
    },
})
