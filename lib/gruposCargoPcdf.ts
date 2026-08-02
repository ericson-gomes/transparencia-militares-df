import type { ChaveCargoPcdf, GrupoCargoPcdf } from "./tipos";

export type { GrupoCargoPcdf } from "./tipos";

/**
 * Agente de Polícia, Escrivão de Polícia, Papiloscopista Policial e Agente
 * de Custódia têm exatamente o mesmo subsídio (Anexo IV, Quadro II, da Lei
 * 15.395/2026 — travado em `test_salario_da_classe_especial_bate_com_o_
 * anexo_iii_e_iv_da_lei_15395_2026` no ETL e no teste de regressão em
 * `lib/dados.test.ts`). Só o Delegado tem tabela própria (Anexo III). Por
 * isso o formulário simplifica pra 2 opções em vez de 5 — escolher
 * qualquer um dos quatro "demais cargos" dá exatamente o mesmo resultado.
 */
export const GRUPOS_CARGO_PCDF: { grupo: GrupoCargoPcdf; nome: string }[] = [
  { grupo: "delegado", nome: "Delegado" },
  { grupo: "demais", nome: "Demais cargos" },
];

/** Representante arbitrário: qualquer um dos quatro dá o mesmo número. */
export const CHAVE_CARGO_POR_GRUPO: Record<GrupoCargoPcdf, ChaveCargoPcdf> = {
  delegado: "delegado",
  demais: "agente",
};

/**
 * Nome exibido no resultado — nunca um cargo específico quando o grupo é
 * "demais", pra não sugerir que a pessoa escolheu um cargo que não escolheu.
 */
export const NOME_EXIBIDO_POR_GRUPO: Record<GrupoCargoPcdf, string> = {
  delegado: "Delegado de Polícia",
  demais: "Agente de Polícia, Escrivão de Polícia, Papiloscopista Policial ou Agente de Custódia",
};
