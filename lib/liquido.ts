/**
 * Tabela de IRRF mensal (retenção na fonte, não a de declaração anual),
 * vigência a partir de janeiro/2026 — Lei 15.191/2025. "Mínimo garantido"
 * assume zero dependentes e zero deduções extras: o imposto mais alto
 * possível, logo o líquido mais baixo possível, um piso e não uma média.
 */
type FaixaIrrf = { ateCentavos: number | null; aliquota: number; deducaoCentavos: number };

const TABELA_IRRF_202601: FaixaIrrf[] = [
  { ateCentavos: 242880, aliquota: 0, deducaoCentavos: 0 },
  { ateCentavos: 282665, aliquota: 0.075, deducaoCentavos: 18216 },
  { ateCentavos: 375105, aliquota: 0.15, deducaoCentavos: 39416 },
  { ateCentavos: 466468, aliquota: 0.225, deducaoCentavos: 67549 },
  { ateCentavos: null, aliquota: 0.275, deducaoCentavos: 90873 },
];

export function calcularIrrf(baseCentavos: number): number {
  const faixa = TABELA_IRRF_202601.find(
    (item) => item.ateCentavos === null || baseCentavos <= item.ateCentavos,
  )!;
  const imposto = Math.round(baseCentavos * faixa.aliquota) - faixa.deducaoCentavos;
  return Math.max(0, imposto);
}

export type ResultadoLiquido = {
  contribuicaoCentavos: number;
  irCentavos: number;
  liquidoCentavos: number;
};

// Lei 3.765/1960, art. 3º-A (alíquota fixada pela Lei 13.954/2019).
const ALIQUOTA_PENSAO_MILITAR = 0.105;
// Lei 10.486/2002, art. 33 §1º — "incidirá sobre o soldo", não a remuneração total.
const ALIQUOTA_ASSISTENCIA_MEDICA_MILITAR = 0.02;

/**
 * Líquido mínimo garantido do militar. Contribuição (pensão + assistência
 * médica) incide sobre o SOLDO, não a remuneração total — achado desta
 * sessão, confirmado na Lei 10.486/2002, art. 33 §1º e art. 36 §2º, e no
 * relato de um militar da ativa. Premissa declarada: assume que só o soldo
 * é base tributável de IR — as demais rubricas (VPE, gratificações) são
 * tratadas como não tributáveis, apoiado em jurisprudência de gratificação
 * similar em outro estado, mas não confirmado especificamente pra VPE do
 * DF (ver spec 2026-08-01, §2.2).
 */
export function liquidoMilitar(
  soldoCentavos: number,
  remuneracaoTotalCentavos: number,
): ResultadoLiquido {
  const contribuicaoCentavos = Math.round(
    soldoCentavos * (ALIQUOTA_PENSAO_MILITAR + ALIQUOTA_ASSISTENCIA_MEDICA_MILITAR),
  );
  const baseIrCentavos = soldoCentavos - contribuicaoCentavos;
  const irCentavos = calcularIrrf(baseIrCentavos);
  return {
    contribuicaoCentavos,
    irCentavos,
    liquidoCentavos: remuneracaoTotalCentavos - contribuicaoCentavos - irCentavos,
  };
}

// Lei Complementar 970/2020 (DF) — IPREV-DF, regime de previdência complementar.
const ALIQUOTA_IPREV_DF = 0.14;
// Teto do RGPS — valor vigente em 2025, NÃO CONFIRMADO especificamente pra
// 2026 (ver spec 2026-08-01, §2.5, pendência fora do código).
const TETO_RGPS_CENTAVOS = 815741;

/**
 * Líquido mínimo garantido da PCDF. Contribuição IPREV-DF (14%) limitada ao
 * teto do RGPS — acima dele existe regime complementar (DF-Previcom, 4,5%
 * a 8,5%, escolha do participante, possivelmente opcional conforme a data
 * de ingresso), deliberadamente OMITIDO: sem ele o número é um piso
 * conservador de verdade — contribuir a mais só reduz o líquido, nunca
 * aumenta (ver spec 2026-08-01, §2.3).
 */
export function liquidoPcdf(subsidioCentavos: number): ResultadoLiquido {
  const baseContribuicaoCentavos = Math.min(subsidioCentavos, TETO_RGPS_CENTAVOS);
  const contribuicaoCentavos = Math.round(baseContribuicaoCentavos * ALIQUOTA_IPREV_DF);
  const baseIrCentavos = subsidioCentavos - contribuicaoCentavos;
  const irCentavos = calcularIrrf(baseIrCentavos);
  return {
    contribuicaoCentavos,
    irCentavos,
    liquidoCentavos: subsidioCentavos - contribuicaoCentavos - irCentavos,
  };
}
