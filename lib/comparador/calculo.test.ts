import { describe, expect, it } from "vitest";
import { calcularComparacao, resolverLado } from "./calculo";
import { liquidoMilitar, liquidoPcdf } from "../liquido";
import type { CarreiraPcdf, CargoPcdf, LadoComparador } from "../tipos";

// Mesmos valores do fixture original (Agente/"demais cargos"), intersticio 3/5/5/0.
const CARGO_AGENTE: CargoPcdf = {
  nome: "Agente de Polícia",
  classes: [
    { nome: "3ª Classe", intersticioAnos: 3, salarioCentavos: 1379441 },
    { nome: "2ª Classe", intersticioAnos: 5, salarioCentavos: 1459370 },
    { nome: "1ª Classe", intersticioAnos: 5, salarioCentavos: 1752306 },
    { nome: "Especial", intersticioAnos: 0, salarioCentavos: 2344038 },
  ],
};

// Delegado — Anexo III da Lei 15.395/2026, mesmos anos de interstício, valores maiores.
const CARGO_DELEGADO: CargoPcdf = {
  nome: "Delegado de Polícia",
  classes: [
    { nome: "3ª Classe", intersticioAnos: 3, salarioCentavos: 2669015 },
    { nome: "2ª Classe", intersticioAnos: 5, salarioCentavos: 2770352 },
    { nome: "1ª Classe", intersticioAnos: 5, salarioCentavos: 3238234 },
    { nome: "Especial", intersticioAnos: 0, salarioCentavos: 3887266 },
  ],
};

const CARREIRA_PCDF = {
  agente: CARGO_AGENTE,
  delegado: CARGO_DELEGADO,
} as unknown as CarreiraPcdf;

const REMUNERACAO_MILITAR = {
  "2º SARGENTO": 1206503,
  CORONEL: 2975660,
  "SOLDADO 1ª CLASSE": 966054,
};

// Soldo (base da contribuição, distinto da remuneração total — ver lib/liquido.ts).
const SOLDO_MILITAR = {
  "2º SARGENTO": 180480,
  CORONEL: 480000,
  "SOLDADO 1ª CLASSE": 106080,
};

const DADOS = {
  remuneracaoMilitarAtual: REMUNERACAO_MILITAR,
  soldoMilitarAtual: SOLDO_MILITAR,
  carreiraPcdf: CARREIRA_PCDF,
};

describe("resolverLado — militar", () => {
  it("resolve pro líquido mínimo garantido do posto informado, não o bruto", () => {
    const lado: LadoComparador = { tipo: "militar", corporacao: "cbmdf", posto: "2º SARGENTO" };
    const resolvido = resolverLado(lado, 2012, 2026, DADOS);
    const esperado = liquidoMilitar(180480, 1206503).liquidoCentavos;
    expect(resolvido.salarioHojeCentavos).toBe(esperado);
    expect(resolvido.salarioHojeCentavos).not.toBe(1206503); // não é o bruto
    expect(resolvido.rotuloHoje).toBe("2º SARGENTO");
  });
});

describe("resolverLado — PCDF", () => {
  it("resolve pro líquido mínimo garantido da classe alcançada pelo interstício, no caso do pai do usuário (ingresso 2012, hoje 2026)", () => {
    const lado: LadoComparador = { tipo: "pcdf", grupo: "demais" };
    const resolvido = resolverLado(lado, 2012, 2026, DADOS);
    const esperado = liquidoPcdf(2344038).liquidoCentavos;
    expect(resolvido.salarioHojeCentavos).toBe(esperado);
    expect(resolvido.salarioHojeCentavos).not.toBe(2344038); // não é o bruto
    expect(resolvido.rotuloHoje).toContain("Especial");
  });
});

describe("calcularComparacao — sempre em cima do líquido", () => {
  it("militar x PCDF, no caso do pai do usuário (ingresso 2012, hoje 2026)", () => {
    const ladoA: LadoComparador = { tipo: "pcdf", grupo: "demais" };
    const ladoB: LadoComparador = { tipo: "militar", corporacao: "cbmdf", posto: "2º SARGENTO" };
    const resultado = calcularComparacao(ladoA, ladoB, 2012, 2026, DADOS);

    const liquidoA = liquidoPcdf(2344038).liquidoCentavos;
    const liquidoB = liquidoMilitar(180480, 1206503).liquidoCentavos;
    expect(resultado.ladoA.salarioHojeCentavos).toBe(liquidoA);
    expect(resultado.ladoB.salarioHojeCentavos).toBe(liquidoB);
    expect(resultado.diferencaMensalCentavos).toBe(liquidoA - liquidoB);
    expect(resultado.projecao).toEqual([
      { anos: 1, acumuladoCentavos: (liquidoA - liquidoB) * 12 },
      { anos: 2, acumuladoCentavos: (liquidoA - liquidoB) * 24 },
      { anos: 3, acumuladoCentavos: (liquidoA - liquidoB) * 36 },
      { anos: 4, acumuladoCentavos: (liquidoA - liquidoB) * 48 },
      { anos: 5, acumuladoCentavos: (liquidoA - liquidoB) * 60 },
    ]);
  });

  it("diferença negativa quando o militar ganha mais — não trava, não inverte o sinal", () => {
    const ladoA: LadoComparador = { tipo: "pcdf", grupo: "demais" };
    const ladoB: LadoComparador = { tipo: "militar", corporacao: "pmdf", posto: "CORONEL" };
    const resultado = calcularComparacao(ladoA, ladoB, 2012, 2026, DADOS);

    const liquidoA = liquidoPcdf(2344038).liquidoCentavos;
    const liquidoB = liquidoMilitar(480000, 2975660).liquidoCentavos;
    expect(resultado.diferencaMensalCentavos).toBe(liquidoA - liquidoB);
    expect(resultado.diferencaMensalCentavos).toBeLessThan(0);
    expect(resultado.projecao[0].acumuladoCentavos).toBeLessThan(0);
  });

  it("PCDF x PCDF compara dois cargos diferentes, ambos em líquido", () => {
    const ladoA: LadoComparador = { tipo: "pcdf", grupo: "delegado" };
    const ladoB: LadoComparador = { tipo: "pcdf", grupo: "demais" };
    const resultado = calcularComparacao(ladoA, ladoB, 2012, 2026, DADOS);

    const liquidoA = liquidoPcdf(3887266).liquidoCentavos;
    const liquidoB = liquidoPcdf(2344038).liquidoCentavos;
    expect(resultado.ladoA.salarioHojeCentavos).toBe(liquidoA);
    expect(resultado.ladoB.salarioHojeCentavos).toBe(liquidoB);
    expect(resultado.diferencaMensalCentavos).toBe(liquidoA - liquidoB);
  });
});
