import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import page from '../../client/index.html'

export const painelPage = UiPage({
    $id: Now.ID['nowrfid-painel-page'],
    endpoint: 'x_snc_nowrfid_painel.do',
    description: 'NowRFID — Painel de cadastramento RFID (React, Horizon Design System)',
    html: page,
    direct: true,
})
