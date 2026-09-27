import { CrossScopePrivilege } from '@servicenow/sdk/core'

// Promotion creates real assets (alm_asset and its HAM/EAM subclasses) and reads the location tree / models.

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-cmn_location-read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'cmn_location',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-cmdb_model-read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'cmdb_model',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-cmdb_model_category-read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'cmdb_model_category',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-alm_asset-read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'alm_asset',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-alm_asset-create'],
    operation: 'create',
    status: 'allowed',
    targetName: 'alm_asset',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-alm_asset-write'],
    operation: 'write',
    status: 'allowed',
    targetName: 'alm_asset',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-alm_hardware-read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'alm_hardware',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-alm_hardware-create'],
    operation: 'create',
    status: 'allowed',
    targetName: 'alm_hardware',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-alm_hardware-write'],
    operation: 'write',
    status: 'allowed',
    targetName: 'alm_hardware',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-sn_ent_asset-read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sn_ent_asset',
    targetScope: 'sn_ent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-sn_ent_asset-create'],
    operation: 'create',
    status: 'allowed',
    targetName: 'sn_ent_asset',
    targetScope: 'sn_ent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-sn_ent_asset-write'],
    operation: 'write',
    status: 'allowed',
    targetName: 'sn_ent_asset',
    targetScope: 'sn_ent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-sn_ent_facility_asset-read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sn_ent_facility_asset',
    targetScope: 'sn_ent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-sn_ent_facility_asset-create'],
    operation: 'create',
    status: 'allowed',
    targetName: 'sn_ent_facility_asset',
    targetScope: 'sn_ent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['nowrfid-xscope-sn_ent_facility_asset-write'],
    operation: 'write',
    status: 'allowed',
    targetName: 'sn_ent_facility_asset',
    targetScope: 'sn_ent',
    targetType: 'sys_db_object',
})
