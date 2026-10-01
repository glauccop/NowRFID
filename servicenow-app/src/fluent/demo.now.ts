import { ScheduledScript } from '@servicenow/sdk/core'
import { syncAndSeed } from '../server/demo-service'

// One-off run of the type sync + demo seed (both idempotent). The list buttons do the same on demand.
ScheduledScript({
    $id: Now.ID['nowrfid-demo-seed-once'],
    name: 'NowRFID — sincronizar tipos e gerar massa de demonstração',
    active: true,
    frequency: 'once',
    executionStart: '2026-10-01 01:30:00',
    timeZone: 'UTC',
    script: syncAndSeed,
})
