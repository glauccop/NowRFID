import { UiAction } from '@servicenow/sdk/core'
import { promoteCurrent } from '../../server/promote-service'
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
