import { describe, expect, it } from "vitest";
import { intersticioHoje, simularTrajetoria } from "./simulador";
import type { DegrauIntersticio } from "../tipos";

const HISTORICO: DegrauIntersticio[] = [
  { origem: "A", vigenciaInicio: "199601", vigenciaFim: null, intersticioAnos: 5 },
  { origem: "B", vigenciaInicio: "199601", vigenciaFim: null, intersticioAnos: 8 },
];

const DEGRAUS = ["A", "B", "C"];
const SALARIOS = { A: 100000, B: 200000, C: 300000 };

describe("intersticioHoje", () => {
  it("usa a entrada sem vigenciaFim", () => {
    expect(intersticioHoje(HISTORICO, "A")).toBe(5);
    expect(intersticioHoje(HISTORICO, "B")).toBe(8);
  });

  it("lança erro se não houver regime vigente pra origem", () => {
    expect(() => intersticioHoje(HISTORICO, "Z")).toThrow();
  });
});

describe("simularTrajetoria", () => {
  it("usa sempre o interstício vigente, mesmo pro passado", () => {
    const passos = simularTrajetoria(DEGRAUS, SALARIOS, HISTORICO, 2012, 2026);
    expect(passos.map((p) => p.ano)).toEqual([2012, 2017, 2025]);
    expect(passos.map((p) => p.degrau)).toEqual(["A", "B", "C"]);
  });

  it("marca como projetado só o degrau além do ano atual", () => {
    const passos = simularTrajetoria(DEGRAUS, SALARIOS, HISTORICO, 2020, 2026);
    expect(passos.map((p) => p.ano)).toEqual([2020, 2025, 2033]);
    expect(passos.map((p) => p.projetado)).toEqual([false, false, true]);
  });

  it("usa o salário do degrau, zero se ausente da tabela", () => {
    const passos = simularTrajetoria(DEGRAUS, { A: 100000 }, HISTORICO, 2012, 2026);
    expect(passos.map((p) => p.salarioCentavos)).toEqual([100000, 0, 0]);
  });
});
