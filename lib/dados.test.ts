import { describe, expect, it } from "vitest";
import {
  carregarCarreiraPcdf,
  carregarMetadados,
  carregarRemuneracaoMilitarAtual,
} from "./dados";

describe("contrato entre os JSON publicados", () => {
  it("a carreira da PCDF cobre os cinco cargos do escopo", () => {
    const carreira = carregarCarreiraPcdf();
    expect(Object.keys(carreira).sort()).toEqual(
      ["agente", "custodia", "delegado", "escrivao", "papiloscopista"].sort(),
    );
  });

  it("toda classe da PCDF tem salário maior que zero", () => {
    for (const cargo of Object.values(carregarCarreiraPcdf())) {
      for (const classe of cargo.classes) {
        expect(classe.salarioCentavos).toBeGreaterThan(0);
      }
    }
  });

  it("a remuneração militar atual cobre pelo menos um posto conhecido", () => {
    const remuneracao = carregarRemuneracaoMilitarAtual();
    expect(remuneracao["CORONEL"]).toBeGreaterThan(0);
  });

  it("os metadados trazem a data de geração", () => {
    expect(carregarMetadados().geradoEm).toBeTruthy();
  });

  it("os quatro cargos comuns da PCDF têm exatamente a mesma classe (salário, interstício e nome) — a UI depende disso pra usar Agente como representante de 'Demais cargos' e simplificar o seletor em 'Delegado' x 'Demais cargos'", () => {
    const carreira = carregarCarreiraPcdf();
    // Confere as classes inteiras, não só o salário: um interstício ou nome
    // diferente entre os quatro passaria batido se só o salário fosse
    // comparado, e a UI usa Agente como representante único do grupo.
    const comuns = ["escrivao", "papiloscopista", "custodia"] as const;
    for (const chave of comuns) {
      expect(carreira[chave].classes).toEqual(carreira.agente.classes);
    }
    // Guarda contra um sexto cargo futuro ser absorvido em silêncio no grupo
    // "demais" sem que ninguém atualize `CHAVE_CARGO_POR_GRUPO`.
    expect(Object.keys(carreira).sort()).toEqual(
      ["agente", "custodia", "delegado", "escrivao", "papiloscopista"].sort(),
    );
  });
});
