# Roadmap NowRFID

Detalhes, decisões e status em [`PLAN.md`](PLAN.md).

| Fase | Escopo | Status |
|---|---|---|
| 1 — MVP | Leitura e gravação RFID, lock/kill/apagar, localizar, config de RF, barcode/QR, lote offline, Debug; staging + `POST /batch` | ✅ Concluída e testada em campo (26/09) |
| 2 — Cadastramento por local | Estrutura nativa `cmn_location` sincronizada no app; sala + tipo de bem antes do scanner; classificação e **Criar ativos** → `alm_asset` / EAM | ✅ Código e deploy (27/09) · ⏳ teste em campo |
| 2.5 — Identidade Horizon + Painel | App Android com tokens, fonte e navegação do **Horizon Design System**; painel no app escopado (UI Page React + tema Horizon da instância): KPIs, capturas por local e tipo, fila de pendentes com **Criar ativos**, qualidade | ✅ Código, APK e deploy (27/09) · ⏳ validação visual e em campo |
| 3 — Levantamento patrimonial | Levantamentos por UG e local; conferência no local / fora do local / sem cadastro / não encontrado; transferências; importador do JSON antigo; EPC GIAI-96 com o patrimônio | 🔜 Próxima |
| 4 — Catálogo offline | `GET /catalog?location=`: o app mostra patrimônio, descrição e situação do bem já na leitura, sem rede | Planejada |
| 5 — Consulta de ativos pelo app | Consultar e vincular ativos existentes. Avaliar o **ServiceNow Mobile SDK** (`NowData`) em vez de uma API própria; exige ponte nativa no RN | A avaliar (spike) |
| 6 — Modelo nativo de RFID | Verificar se `sn_itam_common_rfid_asset` / `alm_asset.rfid_tag` aceitam leitores não-Zebra por API aberta; se sim, migrar a tabela de etiquetas | A avaliar |

## Backlog técnico

- Ação "Classificar como…" com janela de escolha (hoje: edição do tipo na lista).
- Testar OAuth ponta a ponta (hoje só Basic).
- Chave de assinatura própria para o APK (hoje: chave de debug do template).
- Encriptação de tag: não existe na API `RFIDWithUHFBLE` da versão atual do SDK.
- Bytes brutos do BLE no Debug: o listener do SDK não é usado pela demo oficial e poderia interferir no parse.
