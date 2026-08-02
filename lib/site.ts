/**
 * Domínio + subcaminho público onde a calculadora fica publicada — usado no
 * card compartilhável (texto solto, sem link clicável) e para montar o
 * `metadataBase` do site (`app/layout.tsx`).
 *
 * Inclui `/calculadora` porque o site vive num subcaminho de
 * ericsongomes.com.br, que já existe e serve outro conteúdo na raiz: o
 * domínio sozinho não leva a lugar nenhum da calculadora, nem no card (o
 * leitor digitaria o endereço à mão) nem no `metadataBase` (que precisa da
 * base correta pra resolver URLs relativas de metadata sob o subcaminho).
 * Um único valor serve aos dois usos — não há necessidade de separar
 * domínio de URL completa, só de formatar em cada ponto de uso (protocolo
 * em `app/layout.tsx`, barra final na resolução de `metadataBase`).
 */
export const DOMINIO_PUBLICO = "ericsongomes.com.br/calculadora";

/**
 * Repositório público (site + PDFs de origem + ETL + metodologia) que a página
 * de metodologia promete como prova de proveniência e de data de obtenção via
 * histórico do git.
 *
 * O nome cita "militares do DF" porque é assim que a lei agrupa PMDF e CBMDF
 * (a Lei 10.486/2002 é literalmente sobre a remuneração dos militares do
 * Distrito Federal). O nome anterior, transparencia-cbmdf, ficou estreito
 * quando a ferramenta passou a cobrir as duas — o GitHub mantém redirect do
 * endereço antigo.
 *
 * É um repositório separado deste, que continua privado como área de trabalho.
 * Montado por `scripts/extrair-repo-publico.sh`, que exclui `docs/`, `scripts/`
 * e `idea.md` — material de trabalho não vai para o repositório que o site
 * manda auditar.
 */
export const REPOSITORIO_PUBLICO =
  "https://github.com/ericson-gomes/transparencia-militares-df";
