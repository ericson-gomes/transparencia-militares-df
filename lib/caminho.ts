/**
 * Prefixa um caminho de `public/` com o basePath.
 *
 * O Next prefixa sozinho os assets do próprio bundle e os `href` de
 * `next/link`, mas **não** toca em string crua — `url()` no CSS e caminho
 * montado à mão dentro de `style` saem do jeito que foram escritos. Como a
 * calculadora vive sob `/calculadora`, `/fotos/x.jpg` bate na raiz do domínio
 * e dá 404, que foi exatamente o que aconteceu com as fotos da introdução.
 *
 * O valor vem de `NEXT_PUBLIC_BASE_PATH`, que o `next.config.mjs` publica a
 * partir do mesmo `basePath` que configura o Next — um lugar só, sem chance
 * de os dois divergirem.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function caminhoPublico(caminho: string): string {
  return `${BASE}${caminho}`;
}
