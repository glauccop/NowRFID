import { gs, GlideDateTime, GlideRecord } from '@servicenow/glide'
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import { submitBatch } from '../batch-service.ts'
import { getAssetTypes, getStructure } from '../structure-service.ts'
import { promoteBatch } from '../promote-service.ts'
import { getDashboard, promoteClassified } from '../dashboard-service.ts'
import { syncAssetTypes } from '../asset-type-service.ts'

export function ping(_request: RESTAPIRequest, response: RESTAPIResponse) {
    response.setStatus(200)
    response.setBody({
        ok: true,
        user: gs.getUserName(),
        scope: 'x_snc_nowrfid',
        time: new GlideDateTime().getValue(),
    } as any)
}

export function postBatch(request: RESTAPIRequest, response: RESTAPIResponse) {
    let payload: any
    try {
        payload = request.body.data
        if (typeof payload === 'string') payload = JSON.parse(payload)
    } catch (e) {
        response.setStatus(400)
        response.setBody({ errors: [], error: 'Invalid JSON body' } as any)
        return
    }
    const result = submitBatch(payload)
    response.setStatus(result.status)
    response.setBody(result.body as any)
}

function firstParam(value: any): string {
    if (value === undefined || value === null) return ''
    return String(Array.isArray(value) ? value[0] : value)
}

export function getStructureHandler(request: RESTAPIRequest, response: RESTAPIResponse) {
    const result = getStructure(firstParam(request.queryParams && request.queryParams.since))
    response.setStatus(result.status)
    response.setBody(result.body)
}

export function getAssetTypesHandler(_request: RESTAPIRequest, response: RESTAPIResponse) {
    const result = getAssetTypes()
    response.setStatus(result.status)
    response.setBody(result.body)
}

export function promoteBatchHandler(request: RESTAPIRequest, response: RESTAPIResponse) {
    const batchId = firstParam(request.pathParams && request.pathParams.batch_sys_id)
    const batch = new GlideRecord('x_snc_nowrfid_scan_batch')
    if (!batchId || !batch.get(batchId)) {
        response.setStatus(404)
        response.setBody({ error: 'Batch not found' })
        return
    }
    response.setStatus(200)
    response.setBody(promoteBatch(batchId))
}

export function getDashboardHandler(_request: RESTAPIRequest, response: RESTAPIResponse) {
    const result = getDashboard()
    response.setStatus(result.status)
    response.setBody(result.body)
}

export function promoteDashboardHandler(request: RESTAPIRequest, response: RESTAPIResponse) {
    let payload: any = {}
    try {
        payload = request.body && request.body.data ? request.body.data : {}
        if (typeof payload === 'string') payload = JSON.parse(payload || '{}')
    } catch (e) {
        response.setStatus(400)
        response.setBody({ error: 'Invalid JSON body' })
        return
    }
    const strings = (list: any): string[] => (Array.isArray(list) ? list.filter((x: any) => typeof x === 'string' && x) : [])
    response.setStatus(200)
    response.setBody(promoteClassified(strings(payload.locations), strings(payload.items)))
}

export function syncAssetTypesHandler(_request: RESTAPIRequest, response: RESTAPIResponse) {
    response.setStatus(200)
    response.setBody(syncAssetTypes())
}
