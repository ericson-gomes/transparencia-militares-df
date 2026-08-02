import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ComparadorFormulario } from "./ComparadorFormulario";

const PROPS_BASE = {
  corporacao: "cbmdf" as const,
  patentes: ["CORONEL", "2º SARGENTO", "SUBTENENTE"],
  anoIngresso: "" as const,
  anoMaximo: 2026,
  aoMudarCorporacao: () => {},
  aoMudarPatente: () => {},
  aoMudarAnoIngresso: () => {},
};

describe("ComparadorFormulario — rótulo do ano por patente", () => {
  it("pede 'Ano de ingresso' para patente que não é teto de trilha", () => {
    const html = renderToStaticMarkup(
      <ComparadorFormulario {...PROPS_BASE} patente="2º SARGENTO" />,
    );
    expect(html).toContain("Ano de ingresso");
    expect(html).not.toContain("Em que ano você se tornou");
  });

  it("pede 'Em que ano você se tornou Subtenente' para Subtenente", () => {
    const html = renderToStaticMarkup(
      <ComparadorFormulario {...PROPS_BASE} patente="SUBTENENTE" />,
    );
    expect(html).toContain("Em que ano você se tornou Subtenente");
    expect(html).not.toContain(">Ano de ingresso<");
  });

  it("pede 'Em que ano você se tornou Coronel' para Coronel", () => {
    const html = renderToStaticMarkup(
      <ComparadorFormulario {...PROPS_BASE} patente="CORONEL" />,
    );
    expect(html).toContain("Em que ano você se tornou Coronel");
    expect(html).not.toContain(">Ano de ingresso<");
  });
});
