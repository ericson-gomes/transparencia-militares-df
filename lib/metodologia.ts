/**
 * Números que a página de metodologia publica com proveniência.
 *
 * Fica em módulo próprio, e não dentro do componente, para que
 * `metodologia.test.ts` confira esta mesma lista contra `proveniencia.json` —
 * uma cópia da lista no teste deixaria de travar assim que a página crescesse.
 */
export const CHAVES_EXIBIDAS = [
  "remuneracao.identidade",
  "militar.remuneracaoAtual",
  "militar.soldoAtual",
  "pcdf.carreira",
] as const;

export type ChaveProveniencia = (typeof CHAVES_EXIBIDAS)[number];

export const DESCRICOES: Record<ChaveProveniencia, string> = {
  "remuneracao.identidade":
    "Tabela da PMDF publicada pela Secretaria de Economia do DF, idêntica à do CBMDF — é o que autoriza o comparador a valer para as duas corporações.",
  "militar.remuneracaoAtual":
    "Remuneração total vigente de cada patente da PMDF/CBMDF, usada como o lado militar da comparação.",
  "militar.soldoAtual":
    "Soldo (sem gratificações) vigente de cada patente — base de cálculo da contribuição previdenciária do militar no líquido mínimo garantido, distinta da remuneração total.",
  "pcdf.carreira":
    "Classes, interstício e remuneração por cargo da PCDF, usados para simular em que classe a coorte de mesmo ano de ingresso já estaria hoje.",
};
