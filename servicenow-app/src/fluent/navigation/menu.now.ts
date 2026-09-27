import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { adminRole, integrationRole } from '../security/roles.now'

export const nowRfidMenu = ApplicationMenu({
    $id: Now.ID['nowrfid-menu'],
    title: 'NowRFID',
    hint: 'RFID / barcode / QR capture staging',
    description: 'Staging area for captures sent by the NowRFID Android app (Chainway R6)',
    roles: [adminRole, integrationRole],
    active: true,
})

Record({
    $id: Now.ID['nowrfid-module-batches'],
    table: 'sys_app_module',
    data: {
        title: 'Lotes',
        application: nowRfidMenu,
        link_type: 'LIST',
        name: 'x_snc_nowrfid_scan_batch',
        roles: [adminRole, integrationRole],
        active: true,
        order: 100,
    },
})

Record({
    $id: Now.ID['nowrfid-module-items'],
    table: 'sys_app_module',
    data: {
        title: 'Itens (todos)',
        application: nowRfidMenu,
        link_type: 'LIST',
        name: 'x_snc_nowrfid_scan_item',
        roles: [adminRole, integrationRole],
        active: true,
        order: 300,
    },
})

Record({
    $id: Now.ID['nowrfid-module-pending'],
    table: 'sys_app_module',
    data: {
        title: 'Itens pendentes de classificação',
        application: nowRfidMenu,
        link_type: 'FILTER',
        name: 'x_snc_nowrfid_scan_item',
        filter: 'classification_status=pending^ORclassification_status=classified',
        roles: [adminRole, integrationRole],
        active: true,
        order: 200,
    },
})

Record({
    $id: Now.ID['nowrfid-module-tags'],
    table: 'sys_app_module',
    data: {
        title: 'Etiquetas',
        application: nowRfidMenu,
        link_type: 'LIST',
        name: 'x_snc_nowrfid_tag',
        roles: [adminRole, integrationRole],
        active: true,
        order: 400,
    },
})

Record({
    $id: Now.ID['nowrfid-module-types'],
    table: 'sys_app_module',
    data: {
        title: 'Tipos de bem',
        application: nowRfidMenu,
        link_type: 'LIST',
        name: 'x_snc_nowrfid_asset_type',
        roles: [adminRole],
        active: true,
        order: 500,
    },
})
