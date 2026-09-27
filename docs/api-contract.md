# Contrato da API NowRFID

Base: `https://<instancia>.service-now.com/api/x_snc_nowrfid/nowrfid`

Autenticação: OAuth2 (Bearer) ou Basic. O usuário precisa do role **`x_snc_nowrfid.integration`** (ou `x_snc_nowrfid.admin`). Content‑Type `application/json`.

## GET /ping

Verifica conectividade e credenciais.

```json
{ "result": { "ok": true, "user": "nowrfid.integration", "scope": "x_snc_nowrfid", "time": "2026-09-24 21:30:00" } }
```

## GET /structure

Árvore de locais a partir da raiz configurada na propriedade `x_snc_nowrfid.location_root` (inclusive). O app guarda offline.

- `?since=<ISO8601>` (opcional): só os locais alterados depois desse instante (inclui inativos, para o app escondê-los). Use o `server_time` da última resposta.

```json
{ "result": {
  "root": "44083d02fb67075040baf9685eefdca7",
  "server_time": "2026-09-27T02:52:43Z",
  "locations": [
    { "sys_id": "44083d02…", "name": "UG 100001 – Brasília (NowRFID)", "type": "site", "parent": "", "full_name": "UG 100001 – Brasília (NowRFID)", "active": true },
    { "sys_id": "7d18b586…", "name": "Almoxarifado", "type": "room", "parent": "8708bd42…", "full_name": "UG 100001 – Brasília (NowRFID)/Bloco B/Térreo/Almoxarifado", "active": true }
  ] } }
```

`type` é o valor bruto de `cmn_location.cmn_location_type`: `site`, `building/structure`, `floor`, `room` (outros valores podem aparecer). `parent` é `""` para a raiz. `500` se a propriedade não estiver configurada.

## GET /asset-types

Tipos de bem ativos (menu de classificação do app), ordenados por `order`.

```json
{ "result": { "types": [
  { "sys_id": "2f587d8a…", "name": "Cadeira", "icon": "🪑", "order": 10, "model_category": "9307931577…", "asset_class": "sn_ent_facility_asset" }
] } }
```

## POST /batch

Cria um lote e seus itens. **Idempotente** por `batch.client_batch_id`: reenviar o mesmo lote retorna `200` com o lote existente, sem duplicar itens.

### Request

```json
{
  "batch": {
    "client_batch_id": "8a6f2c1e-4b1d-4c7e-9a2b-1f0e5d3c2b1a",
    "device_id": "pixel-7-abc123",
    "reader_mac": "D7:3B:AA:46:B4:E0",
    "captured_at": "2026-09-24T18:30:00Z",
    "app_version": "0.1.0",
    "notes": "",
    "location": "<sys_id da sala (cmn_location)>",
    "asset_type": "<sys_id do tipo de bem>"
  },
  "items": [
    {
      "client_item_id": "c1",
      "capture_type": "rfid",
      "operation": "read",
      "epc": "E2004000780600801570752E",
      "tid": "E2003412013AFB00",
      "user_data": "",
      "rssi": "-55.3",
      "read_count": 3,
      "captured_at": "2026-09-24T18:29:58Z",
      "raw_payload": "{\"pc\":\"3000\",\"ant\":\"1\"}"
    },
    {
      "client_item_id": "c2",
      "capture_type": "rfid",
      "operation": "write",
      "epc": "300833B2DDD9014000000001",
      "captured_at": "2026-09-24T18:31:10Z"
    },
    {
      "client_item_id": "c3",
      "capture_type": "qr",
      "operation": "read",
      "barcode_value": "ASSET-000123",
      "symbology": "QR Code",
      "captured_at": "2026-09-24T18:32:00Z"
    }
  ]
}
```

| Campo | Regras |
|---|---|
| `batch.client_batch_id` | obrigatório, único (UUID gerado no app) |
| `items` | array não vazio |
| `capture_type` | `rfid` \| `barcode` \| `qr` |
| `operation` | `read` (ativo escaneado) \| `write` (tag gravada/criada); padrão `read` |
| `epc` | obrigatório quando `capture_type=rfid` (hex, gravado em maiúsculas) |
| `barcode_value` | obrigatório quando `barcode`/`qr` |
| datas | ISO‑8601 (`Z` ou offset), convertidas para UTC |
| `raw_payload` | string (ou objeto, serializado) até 4000 chars |
| `batch.location`, `batch.asset_type` | opcionais (sys_id). Sala e tipo selecionados no app; valem para todos os itens. Inexistente → `400` |
| `items[].location`, `items[].asset_type` | opcionais; sobrepõem os do lote quando preenchidos. Inexistente → erro só daquele item |

Itens com tipo de bem entram como `classification_status=classified`; sem tipo, `pending` (o admin define o tipo na lista "Itens pendentes de classificação" e depois usa **Criar ativos**).

### Respostas (dentro de `result`)

- `201` criado:
  ```json
  { "batch_sys_id": "…", "batch_number": "RFB0001000", "items_created": 3, "duplicate": false, "pending": 1, "classified": 2, "errors": [] }
  ```
- `200` lote já existia (`duplicate: true`).
- `400` validação: `{ "errors": [], "error": "items must be a non-empty array" }`.
- Itens inválidos não derrubam o lote: aparecem em `errors[]` com `client_item_id` e `message`. Se nenhum item for criado, o lote fica com `status=error`.

## POST /batch/{batch_sys_id}/promote (admin)

Somente role `x_snc_nowrfid.admin` (ACL `NowRFID API promote`; integração recebe `403`). Cria os ativos de todos os itens `classified` do lote — mesma lógica do botão **Criar ativos**:
- classe = `asset_class` do tipo (fallback `alm_asset`), `model` = modelo padrão do tipo (ou `item.model`), `model_category` do tipo, `location` = sala do item, `install_status=1` (Em uso);
- itens barcode/QR: `asset_tag` = valor lido;
- itens RFID: cria/atualiza `x_snc_nowrfid_tag` (EPC/TID → ativo);
- item vira `classification_status=promoted` com `promoted_asset`.

```json
{ "result": { "promoted": 3, "failed": [ { "item": "<sys_id>", "message": "Tipo de bem sem modelo/categoria configurados" } ] } }
```

## Exemplos curl

```bash
BASE=https://<instancia>.service-now.com/api/x_snc_nowrfid/nowrfid

# Token OAuth (password grant)
TOKEN=$(curl -s -X POST https://<instancia>.service-now.com/oauth_token.do \
  -d grant_type=password -d client_id=$CLIENT_ID -d client_secret=$CLIENT_SECRET \
  -d username=nowrfid.integration -d password="$PASS" | jq -r .access_token)

curl -s $BASE/ping -H "Authorization: Bearer $TOKEN"
curl -s "$BASE/structure" -H "Authorization: Bearer $TOKEN"
curl -s "$BASE/structure?since=2026-09-27T02:52:43Z" -H "Authorization: Bearer $TOKEN"
curl -s $BASE/asset-types -H "Authorization: Bearer $TOKEN"

curl -s -X POST $BASE/batch \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d @exemplo-lote.json

# Alternativa Basic (dev)
curl -s -u nowrfid.integration:"$PASS" $BASE/ping
```
