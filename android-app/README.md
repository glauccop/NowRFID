# NowRFID — app Android (React Native + TypeScript)

App de campo para o leitor **Chainway R6** (sled UHF via Bluetooth LE): lê e grava tags RFID, lê códigos de barras e QR Code pelo imager do próprio R6, monta lotes offline e envia ao app escopado **NowRFID** no ServiceNow.

## Funcionalidades

| Aba | O que faz |
|---|---|
| **Conectar** | Busca o R6 por BLE (`Nordic_UART_CW`), conecta, reconecta ao último, mostra bateria/versão/temperatura/potência/região |
| **Escanear** | **1. Preparar:** sincroniza (Wi-Fi) a estrutura de locais e os tipos de bem do ServiceNow e guarda offline; o operador escolhe **Localidade › Prédio › Andar › Sala** e o **tipo de bem** (🪑 Cadeira, 🖥️ Monitor… ou "Classificar depois") e toca **Iniciar scanner**. **2. Capturar:** cabeçalho fixo com sala, tipo e contadores; inventário RFID contínuo ou leitura única; barcode/QR pelo imager do R6; o gatilho físico dispara o modo ativo; itens novos entram no **topo** da lista e releituras só aumentam o contador |
| **Gravar** | "Tag sendo criada": lê a tag alvo, grava um novo EPC (ou gera um de 96 bits), USER bank e lock opcionais, confirma por releitura; a tag gravada leva a sala e o tipo selecionados |
| **Ferram.** | Memória (ler/gravar/apagar qualquer banco), Lock/Unlock/Perma-lock, Kill, Localizar tag (proximidade 0–100), Config RF (potência 5–30 dBm, região, TID no inventário, bip, reset) |
| **Lote** | Revisar/remover itens (com tipo e sala), observações, enviar ao ServiceNow, histórico de envios |
| **Config** | Instância, caminho da API (`/api/x_snc_nowrfid/nowrfid`), Basic ou OAuth 2.0, teste `GET /ping`, liga/desliga o debug |
| **Debug** | Tudo o que trafega em tempo real: comandos ao SDK e respostas, eventos brutos do leitor, requests/responses HTTP (credenciais mascaradas). Filtrar, limpar, compartilhar |

Cada item capturado ou gravado leva a **sala** (`cmn_location`) e o **tipo de bem** selecionados. No ServiceNow, os itens com tipo entram como *classificados*; os sem tipo entram como *pendentes*, até o admin classificar e usar **Criar ativos**.

Os lotes ficam salvos no aparelho até o envio ser confirmado; reenvios não duplicam no ServiceNow (idempotência por `client_batch_id`).

## Arquitetura

```
specs/NativeChainwayRfid.ts        contrato TurboModule (codegen)
android/app/libs/DeviceAPI_ver20251103_release.aar   SDK Chainway
android/app/src/main/java/com/nowrfid/ChainwayRfidModule.kt   ponte Kotlin -> RFIDWithUHFBLE
src/reader/chainway.ts             API tipada + eventos + constantes (bancos, lock, regiões)
src/state/AppState.tsx             estado, lote, merge de leituras, sala/tipo, sincronização, envio
src/structure/tree.ts              árvore de locais (caminho, filhos, sala válida, sync incremental)
src/screens/PrepareCapture.tsx     seleção de local + tipo + "Iniciar scanner"
src/network/serviceNow.ts          cliente REST (Basic/OAuth) com log no Debug
src/debug/debugLog.ts              buffer do console de debug
src/screens/*                      telas
```

Todas as chamadas ao SDK rodam numa fila única fora da thread JS (o rádio atende um comando por vez). Tags do inventário são agrupadas e enviadas ao JS a cada 150 ms.

## Pré-requisitos para compilar

- Node 22+
- **JDK 17** (ex.: `brew install --cask zulu@17`)
- **Android SDK** (Android Studio) com SDK Platform 36/37 e Build-Tools; defina `ANDROID_HOME`
- Celular Android 8.1+ com Bluetooth LE (o SDK Chainway traz libs nativas arm64-v8a/armeabi-v7a — não roda em emulador x86)

## Rodar

```bash
npm install
npx react-native run-android          # debug, com Metro
# ou APK:
cd android && ./gradlew assembleRelease   # android/app/build/outputs/apk/release/
```

> O build release usa a keystore de debug do template. Gere uma keystore própria antes de distribuir.

## Checks

```bash
npm run typecheck
npm test
npm run lint
```

## Build e distribuição (máquina Ubuntu)

O APK é gerado no Ubuntu `glaucco@192.168.1.250` (JDK 17 + Android SDK em `~/Android/Sdk`):

```bash
cd ~/NowRFID/<pasta-do-repositório>/android-app
npm ci && cd android && ./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk ~/NowRFID/download/NowRFID.apk
cd ~/NowRFID/download && python3 -m http.server 8000     # celular: http://192.168.1.250:8000/NowRFID.apk
```

## Teste em campo

Roteiro e resultados em [`../docs/test-cases.md`](../docs/test-cases.md). Resumo do fluxo:

1. **Config**: URL da instância + `nowrfid.integration` → *Testar conexão*.
2. **Conectar** o R6 e, em **Ferram. › Config RF**, escolher a região **Brasil**.
3. **Escanear › Sincronizar**, escolher a sala e o tipo, **Iniciar scanner**, ler tags e códigos.
4. **Lote › Enviar**. No ServiceNow: *NowRFID › Itens* → **Criar ativos**.
