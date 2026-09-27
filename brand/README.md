# Marca NowRFID

| Arquivo | Uso |
|---|---|
| `NowRFID-original.jpeg` | Arte original (1024×1024), a referência da marca |
| `nowrfid-logo-512.png`, `nowrfid-logo-256.png` | Logo completo (arte original) para superfícies grandes: **painel NowRFID no ServiceNow** (Fase 2.5), documentação, apresentações |
| `nowrfid-icon-1024.png`, `nowrfid-icon-512.png` | Ícone simplificado com fundo (loja, capa de documentação) |
| `generate_icons.py` | Gera todos os ícones Android e os PNGs acima (`python3 brand/generate_icons.py`, requer Pillow) |

## Por que o ícone é um redesenho simplificado
A arte original tem 7 espiras finas que viram ruído em 48 px, e o ícone adaptativo do Android corta os cantos (círculo, gota, quadrado arredondado).

O ícone do app mantém a identidade (chip "RFID" com ondas, antena com canto chanfrado, mesmas cores) com **3 espiras mais grossas**, dentro da área segura (50% do quadro de 108 dp). A arte original continua sendo o logo nos tamanhos grandes.

## Cores
| Cor | Hex | Observação |
|---|---|---|
| Azul-marinho | `#062F41` | Fundo do ícone adaptativo (`ic_launcher_background`); ≈ splash do mobile Horizon `#032D42` |
| Verde | `#62CB4B` | Antena e chip |

## Arquivos gerados no app Android
- `android/app/src/main/res/mipmap-*/ic_launcher.png` e `ic_launcher_round.png`: ícone para Android anterior ao 8.
- `ic_launcher_foreground.png` + `values/ic_launcher_background.xml` + `mipmap-anydpi-v26/*.xml`: ícone adaptativo (Android 8+).
- `ic_launcher_monochrome.png`: ícone temático (Android 13+).
- `src/assets/logo-mark.png`: logo no cabeçalho do app.
