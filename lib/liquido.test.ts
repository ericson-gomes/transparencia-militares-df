import { describe, expect, it } from "vitest";
import { calcularIrrf, liquidoMilitar, liquidoPcdf } from "./liquido";

describe("calcularIrrf", () => {
  it("é zero na faixa de isenção", () => {
    expect(calcularIrrf(242880)).toBe(0);
    expect(calcularIrrf(157920)).toBe(0);
  });

  it("aplica a alíquota e deduz a parcela de cada faixa", () => {
    expect(calcularIrrf(282665)).toBe(Math.round(282665 * 0.075) - 18216);
    expect(calcularIrrf(375105)).toBe(Math.round(375105 * 0.15) - 39416);
    expect(calcularIrrf(466468)).toBe(Math.round(466468 * 0.225) - 67549);
  });

  it("usa a alíquota mais alta acima do último degrau", () => {
    expect(calcularIrrf(2229834)).toBe(522331);
  });

  it("nunca é negativo", () => {
    expect(calcularIrrf(0)).toBe(0);
  });
});

describe("liquidoMilitar", () => {
  it("bate com o exemplo de referência: 2º Sargento, soldo 1.804,80, remuneração total 12.065,03", () => {
    const resultado = liquidoMilitar(180480, 1206503);
    expect(resultado.contribuicaoCentavos).toBe(22560);
    expect(resultado.irCentavos).toBe(0);
    expect(resultado.liquidoCentavos).toBe(1183943);
  });
});

describe("liquidoPcdf", () => {
  it("bate com o exemplo de referência: Agente Especial, subsídio 23.440,38", () => {
    const resultado = liquidoPcdf(2344038);
    expect(resultado.contribuicaoCentavos).toBe(114204);
    expect(resultado.irCentavos).toBe(522331);
    expect(resultado.liquidoCentavos).toBe(1707503);
  });

  it("limita a contribuição ao teto do RGPS mesmo pra subsídio bem acima dele", () => {
    const resultado = liquidoPcdf(3887266);
    expect(resultado.contribuicaoCentavos).toBe(114204);
  });
});
