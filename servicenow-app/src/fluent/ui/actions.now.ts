import { UiAction } from '@servicenow/sdk/core'
import { promoteCurrent } from '../../server/promote-service'
import { syncAssetTypesAction } from '../../server/asset-type-service'
import { removeDemoAction, seedDemoAction } from '../../server/demo-service'
import { adminRole } from '../security/roles.now'

UiAction({
    $id: Now.ID['nowrfid-ua-create-assets'],
    table: 'x_snc_nowrfid_scan_item',
    name: 'Criar ativos',
    actionName: 'nowrfid_create_assets',
    showUpdate: true,
    showMultipleUpdate: true,
    list: {
        showBannerButton: true,
        showContextMenu: true,
        style: 'primary',
    },
    form: {
        showButton: true,
        style: 'primary',
    },
    condition: "current.classification_status == 'classified'",
    roles: [adminRole],
    hint: 'Cria o alm_asset (modelo/categoria do tipo de bem, no local do item) e vincula a etiqueta RFID',
    script: promoteCurrent,
})

UiAction({
    $id: Now.ID['nowrfid-ua-sync-asset-types'],
    table: 'x_snc_nowrfid_asset_type',
    name: 'Sincronizar com categorias',
    actionName: 'nowrfid_sync_asset_types',
    list: {
        showBannerButton: true,
        style: 'primary',
    },
    roles: [adminRole],
    hint: 'Gera/atualiza um Tipo de bem para cada categoria de modelo com conta SIAF da disciplina (1231…)',
    script: syncAssetTypesAction,
})

UiAction({
    $id: Now.ID['nowrfid-ua-demo-seed'],
    table: 'x_snc_nowrfid_scan_batch',
    name: 'Gerar massa de demonstração',
    actionName: 'nowrfid_demo_seed',
    list: {
        showBannerButton: true,
    },
    roles: [adminRole],
    hint: 'Cria lotes, ativos (com patrimônio e SIAF) e etiquetas de demonstração na estrutura real do cliente',
    script: seedDemoAction,
})

UiAction({
    $id: Now.ID['nowrfid-ua-demo-remove'],
    table: 'x_snc_nowrfid_scan_batch',
    name: 'Remover massa de demonstração',
    actionName: 'nowrfid_demo_remove',
    list: {
        showBannerButton: true,
    },
    roles: [adminRole],
    hint: 'Apaga os lotes de demonstração, as etiquetas e os ativos criados por eles (ativos pré-existentes são mantidos)',
    script: removeDemoAction,
})
