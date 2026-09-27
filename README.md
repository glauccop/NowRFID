# NowRFID

Leitura **e gravação** de tags RFID UHF (leitor Chainway R6 via Bluetooth LE), leitura de códigos de barras e QR Code, com envio para o ServiceNow como staging para o cadastramento de ativos no EAM.

| Pasta | Conteúdo |
|---|---|
| [`android-app/`](android-app/README.md) | App Android "NowRFID" — React Native + TypeScript com ponte Kotlin para o SDK Chainway |
| [`servicenow-app/`](servicenow-app/README.md) | App escopado ServiceNow "NowRFID" (Fluent / Now SDK): tabelas de staging, roles/ACLs e Scripted REST API |
| [`docs/`](docs/) | [Plano de execução](docs/PLAN.md), [roadmap](docs/roadmap.md), [casos de teste](docs/test-cases.md), [contrato da API](docs/api-contract.md), [estudo do SDK Chainway](docs/chainway-sdk-findings.md), [modelo de dados EAM](docs/servicenow-eam-datamodel.md), [export do sistema anterior](docs/legacy-inventory-export.md) |

## Fluxo

```
ServiceNow (cmn_location + tipos de bem) --Wi-Fi/sync--> app NowRFID (offline)
   operador: Localidade › Prédio › Andar › Sala + Tipo de bem → Iniciar scanner
R6 --BLE--> app: RFID / barcode / QR, gravação de tags → lote
app --HTTPS--> /api/x_snc_nowrfid/nowrfid/batch --> staging (itens sob a sala)
admin: classificar → "Criar ativos" --> alm_asset / sn_ent_facility_asset / alm_hardware + etiqueta RFID
```

Status: Fase 1 (MVP) concluída e testada em campo; Fase 2 (cadastramento por local) instalada em `demoalectriallwfab151756`, aguardando teste em campo; Fase 3 (levantamento patrimonial) é a próxima. Ver [roadmap](docs/roadmap.md).

## Começando

1. Deploy do app ServiceNow: [`servicenow-app/README.md`](servicenow-app/README.md)
2. Build e instalação do app Android: [`android-app/README.md`](android-app/README.md)
