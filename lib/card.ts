import { formatarCentavos } from "./formato";
import { DOMINIO_PUBLICO } from "./site";
import type { ResultadoComparador } from "./tipos";

export type Formato = "story" | "feed";

export type Dimensoes = {
  largura: number;
  altura: number;
};

const DIMENSOES_POR_FORMATO: Record<Formato, Dimensoes> = {
  story: { largura: 1080, altura: 1920 },
  feed: { largura: 1080, altura: 1350 },
};

export function dimensoes(formato: Formato): Dimensoes {
  return DIMENSOES_POR_FORMATO[formato];
}

/**
 * Dados do card. Os salários já chegam em líquido mínimo garantido — o
 * comparador não trabalha mais com bruto em nenhum ponto — herdado direto
 * de `ResultadoComparador.ladoA/ladoB.salarioHojeCentavos`. A explicação da
 * premissa do líquido (zero dependentes, zero deduções) não cabe numa
 * imagem; fica só na tela.
 */
export type DadosCard = {
  rotuloLadoA: string;
  rotuloLadoB: string;
  salarioLadoACentavos: number;
  salarioLadoBCentavos: number;
  diferencaMensalCentavos: number;
  acumuladoCincoAnosCentavos: number;
};

export function paraDadosCard(
  resultado: ResultadoComparador,
  rotuloLadoA: string,
  rotuloLadoB: string,
): DadosCard {
  const ultimaProjecao = resultado.projecao[resultado.projecao.length - 1];
  return {
    rotuloLadoA,
    rotuloLadoB,
    salarioLadoACentavos: resultado.ladoA.salarioHojeCentavos,
    salarioLadoBCentavos: resultado.ladoB.salarioHojeCentavos,
    diferencaMensalCentavos: resultado.diferencaMensalCentavos,
    acumuladoCincoAnosCentavos: ultimaProjecao.acumuladoCentavos,
  };
}

/**
 * As linhas do card, em ordem fixa de exibição — quem desenha o canvas lê
 * por posição, não por conteúdo:
 * 0. kicker (o que é o card)
 * 1. o número-herói: o acumulado projetado em 5 anos, já formatado
 * 2. contexto: os dois lados e seus salários de hoje
 * 3. a diferença mensal de hoje, por extenso
 * 4. proveniência: dados públicos, metodologia no site
 * 5. o endereço, sozinho — é o motivo de o card existir
 */
export function textoDoCard(dados: DadosCard): string[] {
  const {
    rotuloLadoA,
    rotuloLadoB,
    salarioLadoACentavos,
    salarioLadoBCentavos,
    diferencaMensalCentavos,
    acumuladoCincoAnosCentavos,
  } = dados;

  const ladoMaior = diferencaMensalCentavos >= 0 ? rotuloLadoA : rotuloLadoB;

  return [
    "Comparador de carreira · DF",
    formatarCentavos(Math.abs(acumuladoCincoAnosCentavos)),
    `${rotuloLadoA} ${formatarCentavos(salarioLadoACentavos)} · ${rotuloLadoB} ${formatarCentavos(salarioLadoBCentavos)} por mês, hoje.`,
    `Se a diferença de ${formatarCentavos(Math.abs(diferencaMensalCentavos))} por mês se mantiver, é o que ${ladoMaior} ganha a mais em 5 anos.`,
    "Dados públicos. Metodologia e fontes em",
    DOMINIO_PUBLICO,
  ];
}
