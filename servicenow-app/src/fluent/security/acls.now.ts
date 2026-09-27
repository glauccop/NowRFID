import { Acl } from '@servicenow/sdk/core'
import { integrationRole, adminRole } from './roles.now'

// Integration role: read + create (the Android app only inserts). Admin: full CRUD.
Acl({
    $id: Now.ID['x_snc_nowrfid_scan_batch-read'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_batch',
    operation: 'read',
    roles: [integrationRole, adminRole],
    description: 'NowRFID: read x_snc_nowrfid_scan_batch',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_scan_batch-create'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_batch',
    operation: 'create',
    roles: [integrationRole, adminRole],
    description: 'NowRFID: create x_snc_nowrfid_scan_batch',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_scan_batch-write'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_batch',
    operation: 'write',
    roles: [adminRole],
    description: 'NowRFID: write x_snc_nowrfid_scan_batch',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_scan_batch-delete'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_batch',
    operation: 'delete',
    roles: [adminRole],
    description: 'NowRFID: delete x_snc_nowrfid_scan_batch',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_scan_item-read'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_item',
    operation: 'read',
    roles: [integrationRole, adminRole],
    description: 'NowRFID: read x_snc_nowrfid_scan_item',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_scan_item-create'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_item',
    operation: 'create',
    roles: [integrationRole, adminRole],
    description: 'NowRFID: create x_snc_nowrfid_scan_item',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_scan_item-write'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_item',
    operation: 'write',
    roles: [adminRole],
    description: 'NowRFID: write x_snc_nowrfid_scan_item',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_scan_item-delete'],
    type: 'record',
    table: 'x_snc_nowrfid_scan_item',
    operation: 'delete',
    roles: [adminRole],
    description: 'NowRFID: delete x_snc_nowrfid_scan_item',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_asset_type-read'],
    type: 'record',
    table: 'x_snc_nowrfid_asset_type',
    operation: 'read',
    roles: [integrationRole, adminRole],
    description: 'NowRFID: read x_snc_nowrfid_asset_type',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_asset_type-create'],
    type: 'record',
    table: 'x_snc_nowrfid_asset_type',
    operation: 'create',
    roles: [adminRole],
    description: 'NowRFID: create x_snc_nowrfid_asset_type',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_asset_type-write'],
    type: 'record',
    table: 'x_snc_nowrfid_asset_type',
    operation: 'write',
    roles: [adminRole],
    description: 'NowRFID: write x_snc_nowrfid_asset_type',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_asset_type-delete'],
    type: 'record',
    table: 'x_snc_nowrfid_asset_type',
    operation: 'delete',
    roles: [adminRole],
    description: 'NowRFID: delete x_snc_nowrfid_asset_type',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_tag-read'],
    type: 'record',
    table: 'x_snc_nowrfid_tag',
    operation: 'read',
    roles: [integrationRole, adminRole],
    description: 'NowRFID: read x_snc_nowrfid_tag',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_tag-create'],
    type: 'record',
    table: 'x_snc_nowrfid_tag',
    operation: 'create',
    roles: [integrationRole, adminRole],
    description: 'NowRFID: create x_snc_nowrfid_tag',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_tag-write'],
    type: 'record',
    table: 'x_snc_nowrfid_tag',
    operation: 'write',
    roles: [adminRole],
    description: 'NowRFID: write x_snc_nowrfid_tag',
})

Acl({
    $id: Now.ID['x_snc_nowrfid_tag-delete'],
    type: 'record',
    table: 'x_snc_nowrfid_tag',
    operation: 'delete',
    roles: [adminRole],
    description: 'NowRFID: delete x_snc_nowrfid_tag',
})

export const restApiAcl = Acl({
    $id: Now.ID['nowrfid-rest-execute'],
    type: 'rest_endpoint',
    name: 'NowRFID API',
    operation: 'execute',
    roles: [integrationRole, adminRole],
    description: 'NowRFID Scripted REST API access',
})

export const restPromoteAcl = Acl({
    $id: Now.ID['nowrfid-rest-promote-execute'],
    type: 'rest_endpoint',
    name: 'NowRFID API promote',
    operation: 'execute',
    roles: [adminRole],
    description: 'NowRFID: promote staging items to assets (admin only)',
})
