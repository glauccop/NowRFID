# Export do sistema de inventário anterior

Análise dos arquivos exportados pelo programa que a instituição usava com o mesmo leitor: `ug-100001-levantamento-1.json` (612 itens) e `ug-100001-levantamento-19.json` (9 itens). São patrimônios reais e ficam **fora do repositório** (pasta local `amostras/`). Esta análise é a base da **Fase 3** (ver [`PLAN.md`](PLAN.md)).

As chaves vêm cifradas (`C01`, `C02`…). Os significados abaixo foram **inferidos** dos dados. A coluna de confiança indica o quanto a inferência é segura.

## Cabeçalho (o levantamento)

| Chave | Exemplo | Significado | Confiança |
|---|---|---|---|
| C01 | 1, 19 | Nº do levantamento | Alta (bate com o nome do arquivo) |
| C05 | 100001 | UG (Unidade Gestora) | Alta (bate com o nome do arquivo) |
| C07 | 213840 | Local levantado | Média-alta (405 dos 609 bens do lev. 1 estão cadastrados nele) |
| C08 | 0011222 | Operador / comissão | Média |
| C10 / C11 | epoch ms | Início / fim (lev. 1: 25/08 10:01 → 27/08 16:58) | Alta |
| C13 | 01 / 04 | Status: 01 aberto, 04 concluído | Média |
| C15 | epoch ms | Data da exportação | Alta |
| C02 / C04 | "1" / "001" | Desconhecido (igual nos dois arquivos) | — |

## Itens (C12)

| Chave | Exemplo | Significado | Confiança / evidência |
|---|---|---|---|
| C01 | 190282, 058739 | **Nº de patrimônio (tombamento)** | Alta: 6 dígitos com zero à esquerda, único |
| C02 | 235859 | ID interno do bem | Alta: cresce junto com C01 (605/608), com saltos de cerca de 45 mil |
| C03 | 213840 | Local onde o bem está **cadastrado** (não onde foi achado) | Alta: uma mesma gravação mistura até 8 valores, e o GPS de todas as leituras cabe em 45 × 21 m |
| C04 | "" | Sempre vazio | — |
| C05 | 100008513 | Código do material/classe (define o modelo) | Média: só 3 valores no lev. 1 (319 / 160 / 130) |
| C06 | 02 (602), 04, 10, 21 | Situação do bem (?) | Baixa |
| C09 | 01 (599), 02, 16 | Conservação ou tipo de ocorrência (?) | Baixa; os `02` coincidem com `C06=04` e sem GPS |
| C12 | 4 (593), 2 (16) | Forma de identificação: 4 = RFID, 2 = barcode/manual | Média-alta |
| C07 | epoch ms | Momento em que o operador salvou (40 gravações no lev. 1) | Alta |
| C10 / C11 | -15.7967, -47.9600 | Latitude / longitude (Brasília) | Alta |

## Conclusões

- **Levantamento 1:** 405 bens no local levantado, **204 encontrados ali mas cadastrados em 26 outros locais** (candidatos a transferência) e 3 leituras sem cadastro.
- **Levantamento 19:** 0 no local, 8 fora do local, 1 sem cadastro.
- **O export não tem EPC.** As leituras sem cadastro aparecem como números (`18`, `6240216`, `288672`, `2189`). Isso indica que o programa **extraía o nº do patrimônio de dentro do EPC**, ou seja, as etiquetas eram gravadas com o patrimônio. Por isso a Fase 3 adota GIAI-96 (codificação configurável).
- **Não há etiqueta antiga disponível** para confirmar a codificação exata. C06 e C09 serão mapeados pela tabela de códigos, guardando o valor original.

## Teste de aceite do importador (Fase 3)

| Arquivo | Itens | No local | Fora do local | Sem cadastro | Status |
|---|---|---|---|---|---|
| levantamento-1 | 612 | 405 | 204 | 3 | concluído |
| levantamento-19 | 9 | 0 | 8 | 1 | em andamento |

Reimportar o mesmo arquivo não pode duplicar registros.
