const MESES_POR_EXTENSO = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/**
 * Converte um mês no formato "AAAAMM" (a chave usada nos JSON do ETL) para
 * "mês por extenso de ano", ex.: "201503" -> "março de 2015".
 */
export function formatarMesExtenso(mes: string): string {
  const ano = mes.slice(0, 4);
  const indiceMes = Number(mes.slice(4, 6)) - 1;
  return `${MESES_POR_EXTENSO[indiceMes]} de ${ano}`;
}

/**
 * Converte o `geradoEm` do JSON (ISO 8601, ex.: "2026-06-27T14:00:00Z") para
 * "27 de junho de 2026" — a data de corte que o rodapé do site e o bloco 4
 * exibem (Achado 8 da revisão final: nenhuma tela dizia de quando eram os
 * dados).
 */
export function formatarDataExtensa(iso: string): string {
  const data = new Date(iso);
  const dia = data.getUTCDate();
  const mes = MESES_POR_EXTENSO[data.getUTCMonth()];
  const ano = data.getUTCFullYear();
  return `${dia} de ${mes} de ${ano}`;
}
