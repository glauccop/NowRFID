import { BusinessRule } from '@servicenow/sdk/core'
import { syncClassification } from '../../server/promote-service'

BusinessRule({
    $id: Now.ID['nowrfid-br-sync-classification'],
    name: 'NowRFID - sync classification status',
    table: 'x_snc_nowrfid_scan_item',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: syncClassification,
    description: 'Pending <-> classified when the asset type is set/cleared (list edit of the staging items)',
})
