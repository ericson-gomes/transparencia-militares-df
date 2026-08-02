import type { ChaveCorporacao } from "./tipos";

export type CorporacaoMilitar = {
  chave: ChaveCorporacao;
  sigla: string;
  /** Como se chama um integrante, no singular — entra em frase corrida. */
  gentilico: string;
};

/**
 * Identidade das duas corporações militares do DF, só para rótulo — a
 * remuneração e o interstício já são idênticos entre as duas (ver
 * `conferir_identidade_remuneratoria` no ETL), então não há dado numérico
 * aqui que precise de proveniência própria.
 */
export const CORPORACOES_MILITARES: CorporacaoMilitar[] = [
  { chave: "pmdf", sigla: "PMDF", gentilico: "policial militar" },
  { chave: "cbmdf", sigla: "CBMDF", gentilico: "bombeiro militar" },
];
