# NowRFID — Plano de execução

Atualizado em 27/09/2026. Histórico de decisões e status por fase. Roadmap resumido em [`roadmap.md`](roadmap.md); casos de teste em [`test-cases.md`](test-cases.md).

## Contexto

A instituição (setor público, patrimônio por UG) precisa registrar e inventariar bens com o leitor **Chainway R6** (UHF RFID + imager de código de barras/QR, via Bluetooth LE) e levar isso ao módulo **EAM** do ServiceNow.

O estudo de viabilidade concluiu que o **Now Mobile não serve**: ele não tem API de Bluetooth genérico, só câmera, GPS, push, telefone e Siri. Por isso a solução tem duas partes:

- um **app Android próprio** (NowRFID);
- um **app escopado no ServiceNow** (NowRFID, escopo `x_snc_nowrfid`).

Detalhes em [`chainway-sdk-findings.md`](chainway-sdk-findings.md) e [`servicenow-eam-datamodel.md`](servicenow-eam-datamodel.md).

## Decisões de arquitetura

| Decisão | Escolha | Motivo |
|---|---|---|
| Tecnologia do app | React Native + TypeScript, com ponte Kotlin (TurboModule) para o SDK `RFIDWithUHFBLE` | Preferência do usuário por React/TS; o SDK Chainway só existe para Android nativo |
| Destino dos dados | **Staging** escopado; vira `alm_asset` só ao ser classificado | Leitura não confirmada não polui o EAM (e `model`/`model_category` são obrigatórios) |
| Estrutura de locais | **Nativa** `cmn_location` (`cmn_location_type`: site › building/structure › floor › room) | Já existe e é usada pelo EAM/HAM; não duplicar |
| Tipos de bem | Tabela `x_snc_nowrfid_asset_type` apontando para `cmdb_model_category`, `cmdb_model` e a classe do ativo | Menu amigável em português no app, com a classificação nativa por trás |
| Campo da etiqueta | Tabela própria `x_snc_nowrfid_tag` (EPC/TID → ativo) | O modelo nativo `sn_itam_common_rfid_asset` é acoplado ao Zebra MotionWorks (reavaliar na Fase 6) |
| Escopo | `x_snc_nowrfid` | Prefixo de fornecedor da instância é `snc` |
| Instância | `demoalectriallwfab151756` (Australia, EAM ativo) | Escolha do usuário; instância compartilhada, dados de demo identificados como "NowRFID" |
| Build do APK | Máquina Ubuntu `192.168.1.250` (`~/NowRFID`) | Sem permissão de admin no Mac corporativo |

## Fase 1 — MVP ✅ concluída (24–26/09)

- **App: todas as funções do SDK.**
  - inventário contínuo e leitura única
  - gravação de EPC/USER com verificação por releitura
  - lock, kill, apagar
  - localizar tag
  - potência e região
  - barcode/QR pelo imager do R6
- **App: lote e envio.** Lote offline, envio idempotente, console **Debug** com todo o tráfego (leitor e HTTP).
- **ServiceNow:** tabelas Scan Batch e Scan Item e a API `/ping` e `/batch`.
- **Teste em campo (26/09)** encontrou quatro problemas, corrigidos em `d5e7943`:
  - a leitura contínua parava sozinha
  - o leitor recusava comandos enviados logo após conectar (TID, info do leitor, simbologia)
  - o RSSI vinha com vírgula
  - o tipo do código de barras vinha vazio

## Fase 2 — Cadastramento por local ✅ código concluído, ⏳ teste em campo pendente (27/09)

**ServiceNow** (commit `45e79d1`, instalado na instância):
- **Tabelas novas:** tipos de bem e etiquetas RFID.
- **Itens de staging:** ganharam sala, tipo e status de classificação (pendente / classificado / promovido / ignorado).
- **API:**
  - `GET /structure`: árvore abaixo de `x_snc_nowrfid.location_root`, com modo incremental por `?since=`
  - `GET /asset-types`
  - `POST /batch`: recebe sala e tipo
  - `POST /batch/{id}/promote` (só admin)
- **Classificação e promoção:** a business rule troca pendente ↔ classificado; a ação **Criar ativos** gera o ativo na classe do tipo, na sala certa, e registra a etiqueta.
- **Massa de dados (via JARVIS):**
  - site "UG 100001 – Brasília (NowRFID)" › 2 prédios › 5 andares › 20 salas
  - 20 tipos de bem, cada um com seu modelo
  - 10 ativos existentes
  - usuário `nowrfid.integration`

**App:**
- sincronização offline da estrutura e dos tipos
- tela **Preparar** (localidade › prédio › andar › sala + grade de tipos + **Iniciar scanner**)
- tela de captura com cabeçalho de resumo fixo e lista do mais novo para o mais antigo
- itens lidos e gravados herdam a sala e o tipo

**Pendências da fase:**
- [ ] Teste em campo do fluxo completo (casos **TC-20 a TC-28** em [`test-cases.md`](test-cases.md)).
- [ ] Clicar **Criar ativos** pela interface (só a rota REST, que usa a mesma função, foi testada).
- [ ] Testar OAuth (só Basic foi testado).
- [ ] Ação "Classificar como…" com janela de escolha; hoje a classificação é pela edição do tipo direto na lista.

## Fase 2.5 — Painel NowRFID no ServiceNow (planejada)

Um painel dentro do app escopado para acompanhar a operação, com **aparência elegante e cores envolventes, seguindo o Horizon Design System** ([horizon.servicenow.com](https://horizon.servicenow.com)).

**Tecnologia:** página do **UI Builder** (Next Experience) dentro do escopo `x_snc_nowrfid`, com os componentes Now (cartões de KPI, gráficos, listas) e o tema Horizon.
- A paleta vem dos **tokens de cor do tema** (`--now-color_*`), não de valores fixos no código. Assim o painel acompanha a identidade Horizon e os modos claro e escuro.
- As cores de status (sucesso, alerta, crítico, informativo) seguem a semântica Horizon.
- Os gráficos usam a paleta categórica de visualização do Horizon.
- Antes de desenhar, conferir em horizon.servicenow.com a paleta, a tipografia e os padrões de dashboard vigentes.

**Conteúdo inicial:**
- **Cartões de KPI:** lotes recebidos (hoje / 7 dias), itens capturados, **pendentes de classificação**, ativos criados, etiquetas registradas.
- **Onde:** itens por localidade › prédio › andar › sala, com drill-down até a sala e a lista dos itens.
- **O quê:** distribuição por tipo de bem (ícone + nome) e por forma de captura (RFID / barcode / QR, leitura / gravação).
- **Quando:** linha do tempo das capturas e dos envios por dia, e por operador/aparelho.
- **Fila de trabalho:** lista de pendentes com as ações *classificar* e **Criar ativos** direto do painel.
- **Qualidade:** lotes com erro, itens rejeitados (local ou tipo inválidos), etiquetas órfãs.
- **Fase 3 (quando houver levantamento):** % no local / fora do local / sem cadastro / não encontrado por levantamento, e o painel de transferências a aprovar.

**Logo:** `brand/nowrfid-logo-512.png` (arte original) no cabeçalho do painel. Enviar como imagem do app/página no UI Builder; o azul-marinho `#062F41` do logo conversa com o splash do Horizon (`#032D42`).

**Acesso:** role `x_snc_nowrfid.admin` (e uma role de leitura para gestores, se desejado). Entra como módulo **NowRFID › Painel** no menu.

**Aceite:** o painel abre em menos de 3 s com a massa de demo; os números batem com as listas; o drill-down chega à sala; o visual foi revisado contra o Horizon (cores, espaçamento, tipografia) nos temas claro e escuro.

## Fase 3 — Levantamento patrimonial (próxima)

É a conferência de inventário no padrão do sistema antigo. O desenho parte da análise dos exports reais em [`legacy-inventory-export.md`](legacy-inventory-export.md).

1. **Tabelas:**
   - Levantamento `x_snc_nowrfid_survey`: UG, local levantado, comissão/operador, período, status aberto / em andamento / concluído / encerrado, origem app ou importação.
   - Unidade Gestora `x_snc_nowrfid_management_unit`.
   - Mapa de códigos `x_snc_nowrfid_code_map`: códigos antigos de local, C06 e C09 → valores nativos.
2. **Conferência:**
   - Resolução por etiqueta (registro), EPC decodificado → patrimônio (`alm_asset.asset_tag`), TID ou código de barras.
   - Resultado de cada item: **no local**, **fora do local** (candidato a transferência), **sem cadastro**, **não encontrado** (calculado ao finalizar) ou **duplicado**.
3. **Ações de admin:** aceitar transferência (atualiza `alm_asset.location`), marcar não localizado, cadastrar ativo, registrar etiqueta.
4. **Importador `POST /import/legacy-survey`** do JSON do sistema antigo, com o código original preservado.
   - Aceite: levantamento 1 = 612 itens = **405 no local / 204 fora / 3 sem cadastro**; levantamento 19 = 9 itens = 0 / 8 / 1.
5. **Codificação do EPC:** GS1 **GIAI-96** com o nº de patrimônio. Estratégia configurável (`giai96` | `decimal_hex` | `raw`), com os mesmos vetores de teste no app e no servidor. A aba **Gravar** ganha o modo "Patrimônio".
6. **App:** escolher o levantamento aberto antes de escanear, estado de conservação (Decreto 9.373/2018) e GPS opcional.

**Pontos em aberto:** significado real de C06 e C09; se a instituição tem prefixo GS1 licenciado; se local filho conta como o local levantado.

## Fases seguintes

Ver [`roadmap.md`](roadmap.md): catálogo offline no app (Fase 4), consulta de ativos pelo app ou ServiceNow Mobile SDK (Fase 5) e modelo nativo de RFID (Fase 6).

## Operação

| Item | Onde |
|---|---|
| Código | `github.com/glauccop/r6-chainway-servicenow-rfid-project` (`main`) |
| Build do APK | Ubuntu `glaucco@192.168.1.250`: `~/NowRFID/r6-chainway-servicenow-rfid-project/android-app/android && ./gradlew assembleRelease` → `~/NowRFID/NowRFID.apk` |
| Distribuição | `cd ~/NowRFID/download && python3 -m http.server 8000` → `http://192.168.1.250:8000/NowRFID.apk` |
| Deploy ServiceNow | `cd servicenow-app && npm run build && npx now-sdk install --auth demoalectri` |
| Credencial de integração | usuário `nowrfid.integration`; senha **fora do repositório** |
