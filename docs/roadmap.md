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

## Backlog de funcionalidades

- **Caçar ativo perdido (Consultar → Localizar)** — pedido em 08/10. ✅ App 0.4.0 (branch `feature/locate-power`): botão Localizar no resultado da Consultar, bipe no celular com cadência e tom pela proximidade, vibração quando muito perto; `/lookup` passa a devolver o `epc` da etiqueta ativa (⏳ deploy no ServiceNow e teste em campo). O usuário informa o número do ativo (patrimônio/plaqueta, digitado ou lido pela câmera) e o app busca no ServiceNow a etiqueta vinculada (EPC, via `/lookup`). Depois inicia a localização no R6 e **apita cada vez mais rápido e mais agudo** conforme o aparelho chega perto do equipamento, com uma barra de proximidade na tela e vibração opcional. Base pronta: `startLocate`/`onLocate` (valor de proximidade) já existem na ferramenta Localizar, que hoje exige digitar o EPC. Falta: entrada pelo número do ativo, bipe proporcional à proximidade (ou o beep do próprio leitor) e um botão "Localizar" no cartão de resultado da Consultar. Caso de borda: ativo sem etiqueta RFID vinculada não pode ser localizado e a tela deve avisar.
- **Potência do RFID por ambiente (evitar ler tags do cômodo ao lado)** — pedido em 08/10. ✅ App 0.4.0: itens 1–3 (presets na preparação da captura, salva e reaplicada ao conectar, alcance no resumo da tela de leitura). ⏳ Item 4 (potência por sala) não feito. Já existe o ajuste manual de 5–30 dBm em Ferramentas › Config RF, mas ele vale só para a sessão, não fica salvo e fica escondido. Falta: (1) um controle de potência na tela Escanear (presets "Curto / Médio / Longo" ou um slider), visível antes de iniciar o scanner; (2) gravar a escolha nas Ajustes e reaplicá-la ao conectar o R6; (3) mostrar a potência atual no cabeçalho ou no chip do leitor; (4) opcional: guardar a potência por sala/almoxarifado, para que cada local tenha a sua. A potência baixa também favorece Gravar e a caça de ativo perdido.

## Backlog técnico

- Ação "Classificar como…" com janela de escolha (hoje: edição do tipo na lista).
- Testar OAuth ponta a ponta (hoje só Basic).
- Chave de assinatura própria para o APK (hoje: chave de debug do template).
- Encriptação de tag: não existe na API `RFIDWithUHFBLE` da versão atual do SDK.
- Bytes brutos do BLE no Debug: o listener do SDK não é usado pela demo oficial e poderia interferir no parse.
