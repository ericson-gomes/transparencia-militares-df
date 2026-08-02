import type { GrupoCargoPcdf } from "./tipos";

/**
 * Ordem de hierarquia militar (mais alto ao mais baixo), só para exibição no
 * seletor de patente: as chaves de `remuneracao-militar-atual.json` vêm em
 * ordem alfabética (o build grava com `sort_keys=True`), que não é como um
 * militar reconhece a própria carreira.
 */
export const ORDEM_POSTOS = [
  "CORONEL",
  "TENENTE-CORONEL",
  "MAJOR",
  "CAPITÃO",
  "1º TENENTE",
  "2º TENENTE",
  "ASPIRANTE A OFICIAL",
  "CADETE ÚLTIMO ANO",
  "CADETE 1º ANO",
  "SUBTENENTE",
  "1º SARGENTO",
  "2º SARGENTO",
  "3º SARGENTO",
  "CABO",
  "SOLDADO 1ª CLASSE",
  "SOLDADO 2ª CLASSE",
];

/**
 * A partir de Capitão (oficiais intermediários e superiores), a comparação
 * usa o Delegado de Polícia como referência, em vez de "Demais cargos"
 * (Agente) — decisão do usuário, sem base formal de equivalência de posto
 * (mesma regra de sempre: o comparador não afirma equivalência entre
 * carreiras, só compara salário por coorte).
 */
const PATENTES_QUE_COMPARAM_COM_DELEGADO = new Set([
  "CORONEL",
  "TENENTE-CORONEL",
  "MAJOR",
  "CAPITÃO",
]);

export function grupoPcdfDaPatente(patente: string): GrupoCargoPcdf {
  return PATENTES_QUE_COMPARAM_COM_DELEGADO.has(patente) ? "delegado" : "demais";
}

/**
 * Subtenente e Coronel são o teto de cada trilha (praças e oficiais,
 * respectivamente) — não tem patente acima pra promover. Pra essas duas, o
 * ano que o formulário pede não é o de ingresso na corporação: é o ano em
 * que a pessoa alcançou esse teto. Alguém pode ter ingressado há décadas e
 * só ter chegado no teto bem depois — usar o ano de ingresso simularia uma
 * classe da PCDF maior do que a comparação de verdade sustenta.
 */
export const PATENTES_TETO = new Set(["SUBTENENTE", "CORONEL"]);

/** Nome em prosa das duas patentes-teto, pro texto do formulário. */
export const NOME_PATENTE_TETO: Record<string, string> = {
  SUBTENENTE: "Subtenente",
  CORONEL: "Coronel",
};
