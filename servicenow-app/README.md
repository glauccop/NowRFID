# NowRFID — app escopado ServiceNow

App Fluent (Now SDK 4.9) que serve de **staging** para as capturas do app Android NowRFID e cria os ativos reais (`alm_asset` / HAM / EAM) quando os itens são classificados.

- Escopo: `x_snc_nowrfid` · Nome: NowRFID · instalado em `demoalectriallwfab151756`
- API: `/api/x_snc_nowrfid/nowrfid` — `GET /ping`, `GET /structure`, `GET /asset-types`, `POST /batch`, `POST /batch/{id}/promote` (admin). Contrato em [`../docs/api-contract.md`](../docs/api-contract.md)
- Roles: `x_snc_nowrfid.integration` (app: lê estrutura/tipos, cria lotes) e `x_snc_nowrfid.admin` (CRUD, classificação, promoção; contém integration)
- Menu **NowRFID**: **Painel** · Lotes · Itens pendentes de classificação · Itens (todos) · Etiquetas · Tipos de bem

## Modelo de dados

| Tabela | Papel |
|---|---|
| `cmn_location` (nativa) | Estrutura localidade › prédio › andar › sala (`cmn_location_type` = site / building/structure / floor / room). O app baixa a árvore abaixo da raiz configurada. |
| `x_snc_nowrfid_asset_type` (Tipo de bem) | Menu de tipos do app: nome, ícone, ordem, `model_category`, `default_model`, `asset_class` (tabela onde o ativo é criado). |
| `x_snc_nowrfid_scan_batch` (Lote, `RFB…`) | Um envio do app: sala (`location`), tipo padrão (`asset_type`), aparelho, operador. |
| `x_snc_nowrfid_scan_item` (Item) | Cada leitura/gravação (RFID/barcode/QR) com `location`, `asset_type`, `classification_status` (pending / classified / promoted / ignored), `promoted_asset`. |
| `x_snc_nowrfid_tag` (Etiqueta RFID) | EPC/TID → ativo, criado na promoção de itens RFID. |

## Painel (Fase 2.5)

`https://<instancia>.service-now.com/x_snc_nowrfid_painel.do`, também em **NowRFID › Painel** (role `x_snc_nowrfid.admin`).

- **Tecnologia:** UI Page em **React 18 + `@servicenow/react-components`**, entregue pelo próprio Now SDK (`UiPage`, `src/client/`).
  - O HTML inclui `<sdk:now-ux-globals>`, então a página herda o tema Horizon da instância (tokens `--now-*`, modo escuro, fonte Lato).
  - O `app.css` define uma camada de aliases (`--rf-*`) que lê os tokens `--now-*`, com os valores do tema Polaris desta instância como reserva.
- **Identidade:**
  - Faixa de cabeçalho em azul-marinho `#032D42` → índigo primário Horizon, com o logo (`brand/NowRFID-original.jpeg`, embutido em `src/client/assets/logo.ts`).
  - Gráficos com a sequência categórica `--now-datavis_color--qualitative-*`.
- **Conteúdo** (dados de `GET /dashboard`):
  - KPIs: lotes hoje e 7 dias, itens, pendentes, classificados, ativos criados, etiquetas, lotes com erro.
  - **Onde:** árvore localidade › prédio › andar › sala, com contagens acumuladas. Clicar filtra a fila (`?room=`).
  - **O quê:** barras por tipo de bem e fichas por forma de captura.
  - **Quando:** itens por dia, 14 dias.
  - **Fila de trabalho:** `NowRecordListConnected` com edição inline do *Tipo de bem* e o botão **Criar ativos** (`POST /dashboard/promote`: as linhas selecionadas ou todos os classificados do escopo).
  - **Qualidade:** lotes com erro, etiquetas órfãs, itens sem local.
- **Código:**
  - `src/client/` (app.tsx, components/, services/dashboardService.ts, utils/tree.ts)
  - `src/server/dashboard-service.ts`
  - `src/fluent/ui-pages/painel.now.ts`
- **Detalhe técnico:** o wrapper `NowRecordListConnected` desta versão não tem a propriedade de filtro. O `components/FilteredList.tsx` aplica `fixedQuery` no elemento `<now-record-list-connected>` e remonta a lista quando o filtro muda.

## Fluxo

1. App sincroniza `GET /structure` e `GET /asset-types`, operador escolhe sala + tipo e escaneia.
2. `POST /batch` → itens com tipo ficam **classified**; sem tipo, **pending**.
3. Admin em *Itens pendentes de classificação*: define o **Tipo de bem** (edição na lista; a business rule *NowRFID - sync classification status* muda pending ↔ classified).
4. Admin seleciona itens e clica **Criar ativos** (botão de lista/formulário, só admin) → cria o ativo na classe do tipo, com modelo/categoria do tipo, na sala do item, `install_status` = Em uso; barcode/QR vira `asset_tag`; RFID vira registro em Etiquetas.

## Estrutura do código

```
src/fluent/tables/           asset-type, tag, scan-batch, scan-item
src/fluent/security/         roles, acls (inclui ACL REST "NowRFID API promote"), cross-scope (alm_asset, alm_hardware, sn_ent_*)
src/fluent/rest/             nowrfid-api.now.ts (5 rotas)
src/fluent/business-rules/   sync-classification
src/fluent/ui/               actions.now.ts ("Criar ativos")
src/fluent/ui-pages/         painel.now.ts (UI Page React do Painel)
src/client/                  Painel (React + @servicenow/react-components)
src/fluent/navigation/       menu.now.ts
src/server/batch-service.ts      validação, idempotência, lote/itens
src/server/structure-service.ts  árvore de locais e tipos de bem
src/server/promote-service.ts    criação dos ativos e das etiquetas
src/server/rest/handlers.ts      handlers REST
src/fluent/generated/keys.ts     gerado pelo build — versionar
```

Imports relativos entre módulos de `src/server` precisam da extensão `.ts` (ex.: `from '../batch-service.ts'`); sem ela a instância não resolve o `sys_module`.

## Build e deploy

```bash
npm install
npx now-sdk auth --list            # alias usado: demoalectri
npm run build
npx now-sdk install --auth demoalectri
```

## Propriedade da raiz (configuração por instância)

`x_snc_nowrfid.location_root` = sys_id do `cmn_location` raiz enviado ao app. **Não faz parte do pacote** (o install do SDK sobrescrevia o valor a cada deploy); é criada uma vez na instância em *sys_properties*:

- Nome `x_snc_nowrfid.location_root`, tipo string, read roles `x_snc_nowrfid.admin,x_snc_nowrfid.integration`, write roles `x_snc_nowrfid.admin`.
- Em `demoalectriallwfab151756`: raiz `44083d02fb67075040baf9685eefdca7` ("UG 100001 – Brasília (NowRFID)").

## Usuário de integração

`nowrfid.integration` (Web service access only) com role `x_snc_nowrfid.integration`. Senha fora do repositório. Teste:

```bash
curl -u nowrfid.integration:'<senha>' https://<instancia>.service-now.com/api/x_snc_nowrfid/nowrfid/ping
```

OAuth (opcional): *System OAuth › Application Registry › Create an OAuth API endpoint for external clients*; o app usa password grant em `/oauth_token.do`.

## Dados de demonstração (demoalectriallwfab151756)

- Locais: site "UG 100001 – Brasília (NowRFID)" › Bloco A (Térreo, 1º, 2º andar) e Bloco B (Térreo, 1º andar) › 20 salas (códigos reais do levantamento, Auditório, Almoxarifado).
- 20 tipos de bem, cada um com um modelo genérico "NowRFID – …" (mobiliário/facilities → `sn_ent_facility_model`/`sn_ent_facility_asset`; TI → `cmdb_hardware_product_model`/`alm_hardware`).
- 10 ativos existentes (comentário "NowRFID demo", asset_tag = números de patrimônio reais do levantamento) nas salas 213840, 213841, Auditório e 213658.
