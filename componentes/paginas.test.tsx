import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Comparador } from "./Comparador";
import { Metodologia } from "./Metodologia";
import { Topo } from "./Topo";
import { Rodape } from "./Rodape";

// Regra do CLAUDE.md: nenhum texto do site pode pedir voto, urna,
// candidatura, partido ou eleição. Este é o teste que a regra cita — foi
// perdido quando o card compartilhável (que tinha o equivalente em
// `lib/card.test.ts`) saiu na migração para o comparador PM/CBM x PCDF.
const REGRA_SEM_LINGUAGEM_ELEITORAL = /voto|urna|candidat|deputad|eleiç|partido/i;

describe("linguagem eleitoral", () => {
  it("a página do comparador não contém linguagem de voto, urna, candidatura, partido ou eleição", () => {
    const html = renderToStaticMarkup(<Comparador />);
    expect(html).not.toMatch(REGRA_SEM_LINGUAGEM_ELEITORAL);
  });

  it("a página de metodologia não contém linguagem de voto, urna, candidatura, partido ou eleição", () => {
    const html = renderToStaticMarkup(<Metodologia />);
    expect(html).not.toMatch(REGRA_SEM_LINGUAGEM_ELEITORAL);
  });

  it("o topo (menu) não contém linguagem de voto, urna, candidatura, partido ou eleição", () => {
    const html = renderToStaticMarkup(<Topo />);
    expect(html).not.toMatch(REGRA_SEM_LINGUAGEM_ELEITORAL);
  });

  it("o rodapé não contém linguagem de voto, urna, candidatura, partido ou eleição — o site raiz tem esse aviso, a calculadora não pode herdar", () => {
    const html = renderToStaticMarkup(<Rodape />);
    expect(html).not.toMatch(REGRA_SEM_LINGUAGEM_ELEITORAL);
  });
});

describe("formulário fixo — só PMDF, CBMDF e patente", () => {
  it("o seletor de corporação não oferece PCDF — ninguém da PCDF usa o site, ela é só o sistema de comparação", () => {
    const html = renderToStaticMarkup(<Comparador />);
    expect(html).not.toMatch(/<button[^>]*>PCDF<\/button>/);
    expect(html).toMatch(/<button[^>]*>PMDF<\/button>/);
    expect(html).toMatch(/<button[^>]*>CBMDF<\/button>/);
  });
});
