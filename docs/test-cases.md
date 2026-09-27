# NowRFID — Casos de teste

**Legenda:** ✅ passou · ❌ falhou · ⏳ pendente/retestar · — não se aplica.

A coluna **Última execução** traz a data e o que foi observado. Registre cada rodada nova na tabela de execuções, no fim do arquivo.

## Pré-requisitos (teste em campo)

- **Leitor:** Chainway R6 carregado e ligado (aparece como `Nordic_UART_CW`).
- **Celular:** Android 8.1+ com o APK mais recente, baixado de `http://192.168.1.250:8000/NowRFID.apk` (servidor ligado no Ubuntu).
- **Configuração do app:** instância `https://demoalectriallwfab151756.service-now.com`, caminho `/api/x_snc_nowrfid/nowrfid`, Basic Auth, usuário `nowrfid.integration` (senha fora do repositório).
- **Etiquetas:** algumas tags UHF virgens para gravação, tags já lidas, um código de barras EAN-13 e um QR Code.
- **Durante todos os testes:** manter a aba **Debug** ligada. Em caso de falha, use *Compartilhar log* e salve em `amostras/`.

## 1. Conexão com o leitor

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-01 | Permissões | Primeira abertura → Conectar → Buscar | O app pede Bluetooth e Localização; ao negar, mostra uma mensagem e não trava | ✅ 26/09 |
| TC-02 | Descobrir o R6 | Conectar → Buscar | `Nordic_UART_CW` aparece com RSSI, destacado em verde | ✅ 26/09 |
| TC-03 | Conectar | Tocar no R6 | Status CONNECTED e ponto verde no cabeçalho | ✅ 26/09 |
| TC-04 | Informações do leitor | Aguardar cerca de 3 s após conectar | Bateria, versão UHF, temperatura, potência e região preenchidas (antes vinham -1) | ⏳ retestar (corrigido em `d5e7943`) |
| TC-05 | Reconectar | Desconectar → Reconectar último | Volta a CONNECTED sem nova busca | ⏳ |

## 2. Leitura RFID

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-06 | Leitura contínua | Escanear → Iniciar leitura contínua perto de várias tags e aguardar 10 s | A leitura **continua** até tocar Parar; as tags aparecem e o contador de leituras sobe | ❌ 26/09: parou após 0,5 s. Corrigido em `d5e7943`, ⏳ retestar |
| TC-07 | Gatilho físico | Apertar o gatilho do R6 no modo RFID (e apertar de novo) | Liga e desliga o inventário | ✅ 26/09 (liga) |
| TC-08 | Leitura única | Leitura única com uma tag próxima | Uma linha nova no topo da lista | ⏳ |
| TC-09 | TID | Config RF → "Incluir TID" ligado → leitura contínua | As linhas mostram `TID …` | ❌ 26/09: TID vazio. Corrigido, ⏳ retestar |
| TC-10 | RSSI | Ler tags e ver a linha do item | RSSI com ponto decimal (`-44.1`) | ⏳ retestar |
| TC-11 | Sem duplicar | Deixar a mesma tag no campo por 10 s | Uma única linha, com contador `xN` crescente e sem mudar de posição | ⏳ |

## 3. Código de barras e QR

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-12 | EAN-13 | Modo Barcode/QR → gatilho sobre a caixa de um produto | Valor lido, tipo `EAN-13`, badge BARCODE | ✅ 26/09 (valor) · tipo ⏳ retestar |
| TC-13 | Alfanumérico | Ler uma etiqueta de impressora (ex.: `MB729387468`) | Valor correto | ✅ 26/09 |
| TC-14 | QR Code | Ler um QR | Badge QR, tipo contendo "QR" | ⏳ |
| TC-15 | Cancelar | Ler código → Cancelar sem apontar para nada | Volta ao estado normal, sem item novo | ⏳ |

## 4. Gravação e ferramentas de tag

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-16 | Gravar EPC | Gravar → Ler tag alvo → Gerar EPC → Gravar tag | "EPC gravado" e "Verificação por releitura: OK"; item com badge GRAVADA | ⏳ |
| TC-17 | Gravar USER | Igual ao TC-16, com "Gravar também USER bank" | "USER bank gravado"; na aba Ferramentas › Memória, a leitura do USER mostra o valor | ⏳ |
| TC-18 | Lock e kill | Ferramentas › Lock com senha ≠ 00000000; depois Kill numa tag descartável | Confirmação antes de executar; resultado OK; a tag morta deixa de ser lida | ⏳ |
| TC-19 | Localizar | Ferramentas › Localizar com o EPC de uma tag e aproximar | A barra sobe conforme a proximidade | ⏳ |

## 5. Cadastramento por local (Fase 2)

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-20 | Testar conexão | Config → Testar conexão | "Conectado como nowrfid.integration (escopo x_snc_nowrfid)" | ⏳ |
| TC-21 | Sincronizar | Escanear → Sincronizar | "28 locais · 20 tipos de bem" | ⏳ |
| TC-22 | Offline | Modo avião → fechar e reabrir o app → Escanear | Estrutura e tipos continuam disponíveis | ⏳ |
| TC-23 | Seleção de local | Navegar UG › Bloco A › 1º andar › Sala … | Trilha de navegação correta; **Iniciar scanner** só habilita numa sala | ⏳ |
| TC-24 | Tipo de bem | Escolher 🪑 Cadeira → Iniciar scanner | Cabeçalho "Bloco A › 1º andar › Sala …" e "🪑 Cadeira" | ⏳ |
| TC-25 | Lista mais nova no topo | Ler tags uma a uma | Cada tag nova entra **no topo**, sem rolar a tela | ⏳ |
| TC-26 | Trocar de sala | Alterar → outra sala e tipo → ler | O cabeçalho muda; a lista mostra só os itens da nova seleção | ⏳ |
| TC-27 | Enviar | Lote → Enviar ao ServiceNow | "Lote enviado"; o histórico mostra o `RFB…` | ⏳ |
| TC-28 | Reenvio | Forçar erro de rede no envio e reenviar | O lote não se perde; ao reenviar, não duplica no ServiceNow | ⏳ |

## 6. ServiceNow (admin)

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-30 | Itens na sala | NowRFID › Itens: filtrar pelo lote do TC-27 | Cada item com a sala e o tipo escolhidos no app; status **Classified** | ⏳ |
| TC-31 | Pendente | Enviar um lote com "Classificar depois" | Os itens aparecem em **Itens pendentes de classificação** | ⏳ |
| TC-32 | Classificar | Editar o Tipo de bem na lista de pendentes | O status muda para Classified (business rule) | ⏳ |
| TC-33 | Criar ativos | Selecionar itens classificados → **Criar ativos** | Os ativos são criados na classe do tipo (`sn_ent_facility_asset` / `alm_hardware`), na sala, com status Em uso; os itens ficam Promoted | ⏳ (REST ✅ 27/09) |
| TC-34 | Etiqueta registrada | NowRFID › Etiquetas | Um registro EPC/TID → ativo para cada item RFID promovido | ⏳ (REST ✅ 27/09) |
| TC-35 | Código de barras | Promover um item de código de barras | `asset_tag` do ativo = valor lido | ⏳ (REST ✅ 27/09) |
| TC-36 | Segurança | `POST /batch/{id}/promote` com o usuário de integração | 403 (só admin promove) | ✅ 27/09 |
| TC-37 | Local inválido | `POST /batch` com um item cujo `location` não existe | Só aquele item vai para `errors[]`; os outros entram | ✅ 27/09 |

## 7. Debug

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-40 | Tráfego visível | Fazer TC-06 e TC-27 com o Debug aberto | Comandos TX/RX do leitor, eventos de tags, request/response HTTP com senha mascarada | ✅ 26/09 (leitor) |
| TC-41 | Compartilhar | Debug → Compartilhar log | Texto legível com data e hora; filtro Leitor/ServiceNow respeitado | ✅ 26/09 |
| TC-42 | Desligar | Config → desligar modo debug | A aba Debug some e nada mais é registrado | ⏳ |

## 8. Painel NowRFID (Fase 2.5)

URL: `https://demoalectriallwfab151756.service-now.com/x_snc_nowrfid_painel.do` (NowRFID › Painel). Massa de demo: 5 lotes "NowRFID demo" (RFB0001002–1006), 41 itens: 30 classificados e 11 pendentes em 5 salas.

| ID | Caso | Passos | Resultado esperado | Última execução |
|---|---|---|---|---|
| TC-50 | Abrir painel | Menu NowRFID › Painel (admin) | Abre em menos de 3 s: cabeçalho azul-marinho com logo, KPIs e árvore | ⏳ (página e módulo publicados 27/09; renderização não vista) |
| TC-51 | KPIs corretos | Comparar os cartões com as listas | Pendentes 11, Classificados 30 (massa de demo) | ⏳ (contagens conferidas nas tabelas ✅ 27/09) |
| TC-52 | Drill-down | Clicar Bloco A › Térreo › Sala 213840 | A URL ganha `?room=`; a fila mostra só os 11 itens da sala | ⏳ |
| TC-53 | Classificar e criar ativos | Na fila: "Só pendentes", definir o tipo inline, selecionar linhas → **Criar ativos** | Mensagem "n ativo(s) criado(s)"; KPIs atualizam | ⏳ |
| TC-54 | Visual Horizon | Revisar nos temas claro e escuro | Cores, espaçamento e tipografia seguem o Horizon (tokens `--now-*`) | ⏳ |
| TC-55 | Acesso | `GET /dashboard` e `POST /dashboard/promote` com o usuário de integração | 403 "Failed API level ACL Validation" | ✅ 27/09 |
| TC-56 | Filtro da lista | Trocar "Situação" e a sala | A lista respeita o filtro (valida o `fixedQuery` do `FilteredList`) | ⏳ |

## Testes automatizados

App (`android-app/`, rodar `npm test`, `npm run typecheck` e `npm run lint`):

| Arquivo | Cobre |
|---|---|
| `__tests__/App.test.tsx` | O app monta com o módulo nativo simulado |
| `__tests__/logic.test.ts` | Geração e validação de EPC, senha, base64 (UTF-8), agrupamento de leituras (lidas × gravadas) |
| `__tests__/fieldSample.test.ts` | Valores reais do teste de 26/09: RSSI `-44,10`, EAN-13 `7898930575377`, `MB729387468` |
| `__tests__/ScanScreen.test.tsx` | **Regressão**: a leitura contínua não para quando chegam tags (falha no código antigo, passa no novo) |
| `__tests__/structure.test.ts` | Árvore de locais (ordem natural, inativos, caminho, só sala/folha, sincronização incremental) e carimbo de sala/tipo nos itens |
| `__tests__/captureFlow.test.tsx` | Fluxo completo: sincronizar (fetch simulado) → Bloco A › 1º andar › Sala 101 → Cadeira → Iniciar scanner → tag lida aparece como "🪑 Cadeira · Sala 101" |

ServiceNow (`servicenow-app/`): `npm run build` valida os metadados. O teste de fumaça por `curl` está em [`api-contract.md`](api-contract.md) (seção "Exemplos curl"). A Fase 3 prevê testes Jest para a lógica pura (codificação de EPC, classificação, importador), com os JSON reais como aceite.

## Registro de execuções

| Data | Versão (commit) | Quem | Casos | Resultado |
|---|---|---|---|---|
| 26/09/2026 | `c7efc26` | Glaucco (campo, em casa) | TC-01–03, 06, 07, 09, 12, 13, 40, 41 | Conexão e leitura OK; leitura contínua parando, TID vazio, info do leitor -1, tipo do código vazio → corrigidos em `d5e7943` |
| 27/09/2026 | Fase 2.5 | Agente (build/deploy/REST) | TC-55 | Painel publicado; rotas protegidas; renderização pendente de sessão admin |
| 27/09/2026 | `45e79d1` | Agente (REST/curl) | TC-33–37 via API | Promoção cria ativos, etiquetas e `asset_tag`; 403 para integração; item com local inválido isolado |
