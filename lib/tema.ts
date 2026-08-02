import type { ChaveCorporacao } from "@/lib/tipos";

/**
 * A corporação inicial vive aqui, e não em dois lugares. O `layout.tsx`
 * precisa dela para escrever `data-corporacao` no HTML servido, e a
 * `Calculadora` para o estado inicial do formulário. Enquanto os dois
 * escreviam o valor à mão, um abria em laranja e o outro em azul, e o
 * carregamento piscava de uma cor para a outra.
 */
export const CORPORACAO_PADRAO: ChaveCorporacao = "pmdf";

/** Chave do tema no CSS. É a mesma que o site usa no seletor do topo. */
export type Tema = "cbm" | "pm";

export function temaDaCorporacao(chave: ChaveCorporacao): Tema {
  return chave === "cbmdf" ? "cbm" : "pm";
}
