# Comparador PM/CBM x PCDF — carreira do DF

Ferramenta que compara, a partir da patente atual e do ano de ingresso de um
policial militar ou bombeiro do Distrito Federal, quanto um policial civil que
entrou na PCDF na mesma época já ganha hoje — e o que essa diferença
representa em 1 a 5 anos.

Publicada em **[ericsongomes.com.br/calculadora](https://ericsongomes.com.br/calculadora)**.

Este repositório existe para que qualquer pessoa possa refazer as contas. Os
documentos de origem estão versionados aqui — se um órgão retirar um arquivo do
ar, a cópia usada no cálculo e a data em que foi obtida continuam registradas
no histórico do git.

## Onde cada número nasce

| Fonte | O que fornece | Onde está |
|---|---|---|
| Tabela de remuneração do CBMDF (jan/2026) | Remuneração total por patente militar | `data/raw/remuneracao-2026-01.pdf` |
| Tabelas da Secretaria de Economia do DF, PMDF e CBMDF | Prova de que a remuneração das duas corporações é idêntica | `data/raw/pmdf/tabela-remuneracao-*.html` |
| Lei 15.395/2026, Anexo I | Soldo por posto — base da contribuição previdenciária do militar | `data/raw/pmdf/lei-15395-2026.htm` |
| Lei 15.395/2026, Anexos III e IV | Tabela de subsídio da PCDF, por cargo e classe | `data/raw/pmdf/lei-15395-2026.htm` |
| Lei 9.264/1996 + Decreto 7.652/2011 + Lei 14.724/2023 | Estrutura de classes e interstício da carreira da PCDF | `data/raw/carreira-pcdf.json`, `data/raw/pcdf/decreto-7652-2011.htm` |

A procedência de cada número exibido também é publicada em máquina, em
`public/data/proveniencia.json`, e a página de metodologia do site a lê de lá.
Há teste que falha se um número chegar à tela sem registro.

## Fontes primárias

**Toda norma e toda tabela citadas aqui estão versionadas neste repositório.**
Não há afirmação que dependa de um arquivo continuar no ar em servidor de
terceiro. O `urls.txt` de cada diretório de `data/raw/` registra, por arquivo, a
URL de origem e a data em que foi obtido, e explica para que cada um serve.

Legislação, toda do Portal da Legislação (Planalto):

| Norma | O que sustenta | Cópia |
|---|---|---|
| [Lei 15.395/2026](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15395.htm) | Soldo (Anexo I), VPE (Anexo II), subsídio do Delegado (Anexo III) e dos demais cargos da PCDF (Anexo IV) | `data/raw/pmdf/lei-15395-2026.htm` |
| [MP 1.326/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/mpv/mpv1326.htm) | Registro histórico da medida provisória convertida na lei acima | `data/raw/pmdf/mp-1326-2025.htm` |
| [Lei 10.486/2002](https://www.planalto.gov.br/ccivil_03/leis/2002/l10486.htm) | Remuneração dos militares do DF: soldo, APG, AOM, GFR, ACP; base da contribuição previdenciária (art. 33 §1º e art. 36 §2º) | `data/raw/pmdf/lei-10486-2002.htm` |
| [Lei 11.134/2005](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11134.htm) | Vantagem Pecuniária Especial (VPE) | `data/raw/pmdf/lei-11134-2005.htm` |
| [Lei 12.086/2009](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12086.htm) | Promoções na PMDF e no CBMDF: critérios, interstícios (Anexos I e IV), cursos e datas | `data/raw/pmdf/lei-12086-2009.htm` |
| [Lei 7.289/1984](https://www.planalto.gov.br/ccivil_03/leis/l7289.htm) | Estatuto dos Policiais Militares do DF — escala hierárquica | `data/raw/pmdf/lei-7289-1984.htm` |
| [Lei 7.479/1986](https://www.planalto.gov.br/ccivil_03/leis/l7479.htm) | Estatuto dos Bombeiros Militares do DF | `data/raw/pmdf/lei-7479-1986.htm` |
| [Lei 9.264/1996](https://www.planalto.gov.br/ccivil_03/leis/l9264.htm) | Carreiras da PCDF: desmembramento, cargos, ingresso na 3ª classe | `data/raw/pcdf/lei-9264-1996.htm` |
| [Lei 11.361/2006](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11361.htm) | Remuneração da PCDF exclusivamente por subsídio, em parcela única | `data/raw/pcdf/lei-11361-2006.htm` |
| [Lei 14.724/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14724.htm) | Reajuste anterior da PCDF — degrau de janeiro/2024 | `data/raw/pcdf/lei-14724-2023.htm` |
| [Decreto 7.652/2011](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/decreto/d7652.htm) | Progressão funcional na PCDF: interstício por classe, avaliação, curso | `data/raw/pcdf/decreto-7652-2011.htm` |

Tabelas aplicadas, publicadas pela Secretaria de Estado de Economia do DF
(índice em [economia.df.gov.br/carreiras-do-df](https://www.economia.df.gov.br/carreiras-do-df)),
todas com vigência janeiro/2026 e atualizadas pelo órgão em 07/05/2026:

| Carreira | Origem | Cópia |
|---|---|---|
| Polícia Militar do DF | [PDF](https://www.economia.df.gov.br/documents/d/seec/policia-militar-pdf) | `data/raw/pmdf/tabela-remuneracao-pmdf-seec-202601.pdf` |
| Bombeiro Militar do DF | [PDF](https://www.economia.df.gov.br/documents/d/seec/bombeiro-militar-pdf-2) | `data/raw/pmdf/tabela-remuneracao-cbmdf-seec-202601.pdf` |
| Polícia Civil do DF | [PDF](https://www.economia.df.gov.br/documents/d/seec/policia-civil-1-pdf) | `data/raw/pcdf/tabela-subsidio-policia-civil-seec-202601.pdf` |
| Delegado de Polícia do DF | [PDF](https://www.economia.df.gov.br/documents/d/seec/delegado-de-policia-1-pdf-1) | `data/raw/pcdf/tabela-subsidio-delegado-seec-202601.pdf` |

O par de janeiro/2020 das duas corporações militares
(`data/raw/pmdf/tabela-remuneracao-*-seec-202001.html`) continua versionado à
parte: é ele que o build recompara a cada rodada para provar a identidade entre
PMDF e CBMDF.

> **As páginas HTML da Secretaria de Economia continuam exibindo a tabela de
> janeiro de 2020.** Só o PDF de cada carreira está atualizado. Quem conferir
> pelo HTML vai encontrar valores de seis anos atrás e concluir, errado, que o
> site está desatualizado.

## Valores vigentes

### PMDF e CBMDF — vigência janeiro/2026

Tabela única para as duas corporações (ver seção seguinte). `TOTAL` é o número
que entra no lado militar da comparação; `SOLDO` é o que serve de base à
contribuição previdenciária.

| Posto ou graduação | Soldo | APG | VPE | Total | Aux. alimentação |
|---|---|---|---|---|---|
| Coronel | 4.800,00 | 80% | 15.452,11 | 29.756,60 | 850,00 |
| Tenente-Coronel | 4.608,00 | 80% | 13.533,03 | 27.346,00 | 850,00 |
| Major | 4.401,60 | 80% | 11.611,03 | 24.895,62 | 850,00 |
| Capitão | 3.657,60 | 75% | 10.170,43 | 20.270,22 | 850,00 |
| 1º Tenente | 3.379,20 | 70% | 10.093,99 | 18.733,71 | 850,00 |
| 2º Tenente | 3.124,80 | 70% | 9.873,70 | 18.014,80 | 850,00 |
| Aspirante a Oficial | 2.692,80 | 50% | 7.469,25 | 14.225,07 | 850,00 |
| Cadete (último ano) | 1.060,80 | 50% | 4.667,88 | 8.286,18 | 850,00 |
| Cadete (demais anos) | 753,60 | 50% | 3.647,61 | 6.802,04 | 850,00 |
| Subtenente | 2.424,00 | 65% | 10.353,04 | 18.211,37 | 850,00 |
| 1º Sargento | 2.112,00 | 65% | 7.161,85 | 14.268,26 | 850,00 |
| 2º Sargento | 1.804,80 | 65% | 6.240,41 | 12.065,03 | 850,00 |
| 3º Sargento | 1.608,00 | 65% | 5.905,03 | 11.314,40 | 850,00 |
| Cabo | 1.204,80 | 60% | 5.343,21 | 9.600,63 | 850,00 |
| Soldado 1ª Classe | 1.060,80 | 60% | 5.110,76 | 9.100,34 | 850,00 |
| Soldado 2ª Classe | 753,60 | 50% | 3.647,61 | 6.802,04 | 850,00 |

Demais componentes, iguais para todos os postos: AOM R$ 609,60 (12,70% do soldo
de Coronel), GFR 1% do soldo, GCEF R$ 406,89 e GRV R$ 1.000,00.

A Secretaria de Economia rotula as praças especiais como "ALUNO 3º ANO" e
"ALUNO 1º/2º ANO"; a Lei 15.395/2026 as chama de "Cadete (último ano)" e
"Cadete (demais anos)". São os mesmos degraus e os mesmos valores — o ETL
normaliza para a grafia da lei.

O soldo teve reajuste em dois degraus, não um. O Anexo I da Lei 15.395/2026
publica as três colunas: até 30/11/2025 (valor congelado), a partir de
1º/12/2025 e a partir de 1º/01/2026. O comparador usa só a terceira.

### PCDF — subsídio por classe, vigência janeiro/2026

| Cargo | Especial | Primeira | Segunda | Terceira |
|---|---|---|---|---|
| Delegado de Polícia | 38.872,66 | 32.382,34 | 27.703,52 | 26.690,15 |
| Perito Criminal e Perito Médico-Legista | 38.872,66 | 32.382,34 | 27.703,52 | 26.690,15 |
| Agente, Escrivão, Papiloscopista e Agente Policial de Custódia | 23.440,38 | 17.523,06 | 14.593,70 | 13.794,41 |

Os quatro cargos da última linha têm subsídio idêntico — é por isso que o
formulário oferece dois grupos ("Delegado" e "Demais cargos") em vez de cinco
opções: escolher qualquer um dos quatro dá exatamente o mesmo resultado.

Fora do subsídio, e fora da conta do comparador: auxílio-alimentação
suplementado (Lei distrital 7.072/2022) e auxílio-uniforme de R$ 3.000,00 anuais,
pagos em dezembro em parcela única (Lei distrital 7.073/2021).

### Por que PMDF e CBMDF mostram os mesmos valores

Soldo e VPE saem de anexos únicos (Lei 10.486/2002 e Lei 11.134/2005, na
redação da Lei 15.395/2026), sem desdobramento por corporação — o próprio texto
da lei rotula um degrau como "Cadete da Academia de Polícia Militar **ou**
Bombeiro Militar". As duas tabelas que a Secretaria de Economia do DF publica —
uma por corporação — são idênticas célula a célula, tanto na vigência de
janeiro/2020 (o par versionado em `data/raw/`, que o build recompara a cada
rodada) quanto na de janeiro/2026. O build aborta se um dia divergirem.

O que difere entre as duas corporações não é a remuneração: é o ritmo de
carreira. Ver a tabela de interstícios abaixo.

## Estrutura de carreira

O comparador não simula promoção militar — a patente é informada pela pessoa e
fica constante na projeção de 1 a 5 anos. A carreira da PCDF, essa sim, é
simulada por interstício. A estrutura das duas está aqui porque é o que permite
julgar se a comparação é honesta.

### Hierarquia militar (Lei 7.289/1984, art. 15, e Lei 7.479/1986)

- **Oficiais superiores:** Coronel, Tenente-Coronel, Major
- **Oficiais intermediários:** Capitão
- **Oficiais subalternos:** 1º Tenente, 2º Tenente
- **Praças especiais:** Aspirante-a-Oficial, Aluno-Oficial (cadete)
- **Subtenentes e sargentos:** Subtenente, 1º, 2º e 3º Sargento
- **Cabos e soldados:** Cabo, Soldado 1ª Classe, Soldado 2ª Classe

A Lei 12.086/2009 fixa o efetivo da PMDF em 18.673 militares (art. 2º) e o
distribui em quadros: QOPM (combatente), QOPMS (saúde), QOPMC (capelães),
QOPMA (administrativo), QOPME (especialistas), QOPMM (músicos), QPPMC e QPPME
(praças). No CBMDF: QOBM/Comb, QOBM/S, QOBM/Compl, QOBM/Intd, QOBM/Cond,
QOBM/Mnt, QOBM/Mús, QOBM/Cpl e o Quadro-Geral de Praças.

### Como se sobe de patente (Lei 12.086/2009)

Cinco critérios de promoção (art. 6º):

1. **Antiguidade** (art. 7º) — precedência hierárquica dentro do mesmo quadro.
   É o critério padrão: o art. 25 determina que todas as promoções, exceto ao
   último posto, sejam por antiguidade.
2. **Merecimento** (art. 8º) — **exclusivo para o acesso ao último posto** de
   cada quadro ou especialidade (art. 24).
3. **Ato de bravura** (art. 9º) — dispensa as demais exigências; pedido em até
   120 dias do fato.
4. ***Post mortem*** (arts. 10 e 11).
5. **Ressarcimento de preterição** (arts. 14 e 15) — recurso provido,
   absolvição, erro administrativo comprovado.

**Interstício** é o tempo mínimo no posto ou graduação (art. 5º) e pode ser
**reduzido em até 50%** quando houver vagas não preenchidas por essa condição —
motivo pelo qual o tempo real de carreira costuma ser menor que o da tabela.

Promoções ocorrem em datas fixas: 22 de abril, 21 de agosto e 26 de dezembro na
PMDF (art. 29) e para os oficiais do CBMDF; 30 de março, 30 de julho e 30 de
novembro para as praças do CBMDF (art. 88).

Interstício por grau, PMDF (Anexo I, quadros QOPM e QPPMC) e CBMDF (Anexo IV,
quadro combatente e Quadro-Geral de Praças):

| Grau | PMDF | CBMDF |
|---|---|---|
| Coronel | teto | teto |
| Tenente-Coronel | 36 meses | 36 meses |
| Major | 48 meses | 48 meses |
| Capitão | 48 meses | 72 meses |
| 1º Tenente | 48 meses | 48 meses |
| 2º Tenente | 48 meses | 48 meses |
| Aspirante-a-Oficial | 6 meses | — |
| Subtenente | teto | teto |
| 1º Sargento | 36 meses | 24 meses |
| 2º Sargento | 60 meses | 48 meses |
| 3º Sargento | 60 meses | 48 meses |
| Cabo | 60 meses | 60 meses |
| Soldado 1ª Classe | 120 meses | 120 meses |
| Soldado 2ª Classe | — | 6 meses |

Lê-se como "tempo a cumprir *naquele* grau para subir ao seguinte". O CBMDF
exige ainda tempo de serviço arregimentado em paralelo ao interstício, e cobra
72 meses no posto de Capitão onde a PMDF cobra 48.

Além do interstício, a promoção exige curso concluído com aproveitamento
(art. 31 §1º para a PMDF; art. 86 para o CBMDF): CFO, CAO e CAEO na trilha de
oficiais combatentes; CFP, CAP e CAEP na de praças; CHO e CPO nas trilhas de
habilitação. Somam-se 70% de aproveitamento no teste de aptidão física e
inspeção de saúde.

### Como se sobe de classe na PCDF (Decreto 7.652/2011)

Na PCDF não há promoção, e sim **progressão**: a mudança para a classe
imediatamente superior (art. 2º). As classes são 3ª, 2ª, 1ª e Especial, e o
ingresso é sempre na 3ª (Lei 9.264/1996, art. 5º). A regra vale igual para a
Carreira de Delegado de Polícia e para a Carreira de Polícia Civil.

Três requisitos cumulativos (art. 3º):

1. **Exercício ininterrupto do cargo** — 3 anos da 3ª para a 2ª classe, 5 anos
   da 2ª para a 1ª e 5 anos da 1ª para a Especial.
2. **Avaliação de desempenho satisfatória** — apurada a cada 12 meses pela
   chefia imediata; ao fim do interstício conta a média do período. Média
   insatisfatória mantém o servidor na classe até que ela melhore (art. 5º).
3. **Curso de aperfeiçoamento concluído com aproveitamento** — ofertado pela
   Academia de Polícia Civil, preferencialmente pós-graduação no caso da classe
   Especial (art. 6º).

O interstício é **interrompido** — e recontado do zero a partir do retorno — por
licença ou afastamento sem remuneração, suspensão disciplinar, falta
injustificada e prisão por sentença transitada em julgado (art. 4º).

**É por isso que a simulação da PCDF é um piso, não uma previsão.** O comparador
assume os interstícios mínimos cumpridos sem atraso. Na prática, avaliação
insatisfatória, fila de curso ou interrupção adiam a progressão, e a pessoa da
PCDF ganharia *menos* que o simulado. O número que a ferramenta mostra é o mais
conservador que a norma permite.

## Refazendo os números

O ETL lê os documentos de origem e gera os JSON que o site consome. Nenhum
número é digitado à mão na interface: se um valor da tela divergir do
documento, o teste quebra.

```bash
cd etl
uv sync
uv run python -m etl.build   # regenera public/data/*.json
uv run pytest                # confere os números contra os documentos
```

O site:

```bash
npm install
npm run test
npm run build    # export estático em out/
```

O build impõe duas conferências antes de gravar qualquer coisa: as tabelas de
remuneração da PMDF e do CBMDF têm que continuar idênticas
(`conferir_identidade_remuneratoria`) e todo número publicado tem que ter
registro de proveniência (`Proveniencia.exigir_completo`). Se qualquer uma
falhar, o build para.

## Armadilhas conhecidas de quem for conferir

- **A tabela legal se lê por anexo, nunca por título.** A Lei 15.395/2026 traz
  duas tabelas de soldo com o mesmo rótulo "TABELA I - SOLDO": a do Anexo I
  (militares do DF) e a do Anexo V (ex-Territórios Federais), com valores
  diferentes. No HTML da lei o título do Anexo I vem quebrado no meio de tags,
  então buscar por título casa o anexo errado e publica o soldo de outra
  carreira sem sintoma nenhum. O ETL ancora no par (designação do anexo, lei
  alterada).
- **Cite a lei, não a MP.** Enquanto vigorava, a MP 1.326/2025 era a norma;
  convertida na Lei 15.395/2026, deixou de ser fonte autônoma do direito. A MP
  continua versionada como registro histórico, e um teste compara os dois
  anexos para provar que a conversão não mexeu em valor nenhum.
- **As páginas HTML da Secretaria de Economia mostram janeiro de 2020.** Só os
  PDFs foram atualizados para janeiro de 2026.
- **O Anexo IV da Lei 15.395/2026 usa uma nomenclatura que não entrou em
  vigor.** O Quadro II do anexo se intitula "valor do subsídio para os Oficiais
  Investigadores de Polícia e Papiloscopistas", mas o dispositivo que de fato
  transformaria os cargos de Agente de Polícia, Escrivão de Polícia e Agente
  Policial de Custódia em "Oficial Investigador de Polícia" foi vetado por
  inconstitucionalidade. Até que o veto seja apreciado, os cargos permanecem com
  os nomes antigos — que é como a Secretaria de Economia segue rotulando a
  tabela e como este projeto os nomeia. Os valores não mudam nas duas hipóteses.
- **A contribuição previdenciária do militar incide sobre o soldo, não sobre a
  remuneração total** (Lei 10.486/2002, art. 33 §1º e art. 36 §2º). Usar o total
  como base infla o desconto e subestima o líquido militar. Ver `lib/liquido.ts`.

## Limitações

Estão declaradas na própria página de metodologia, não escondidas aqui. Em
resumo:

- Todos os valores da tela são **líquido mínimo garantido**: zero dependentes,
  zero deduções. Nada é exibido em bruto.
- A simulação da PCDF assume interstício mínimo cumprido, sem atraso por
  avaliação de desempenho ou fila de curso — é um piso, pelas razões acima.
- A projeção de 1 a 5 anos mantém a patente militar constante. Quem for promovido
  na janela ganha mais que o projetado.
- A comparação é por coorte de ano de ingresso. **Não afirma equivalência entre
  postos militares e classes da PCDF** — não existe base legal para essa
  equivalência, e o projeto não a inventa.
- O teto do RGPS usado no líquido da PCDF é o valor vigente em 2025, ainda não
  confirmado para 2026.
- A contribuição complementar do DF-Previcom (acima do teto do RGPS, alíquota de
  escolha do participante) fica de fora da conta de propósito.

## Encontrou um erro

Abra uma issue apontando o número, a tela onde ele aparece e o documento que o
contradiz. Erro confirmado é corrigido e o histórico da correção fica público.
