import { describe, expect, it } from "vitest";
import { DOMINIO_PUBLICO, REPOSITORIO_PUBLICO } from "./site";

describe("DOMINIO_PUBLICO", () => {
  it("não pode terminar em .invalid — é o placeholder que bloqueia publicação sem domínio real", () => {
    // Achado 6 da revisão final: nada barrava publicar com o domínio-placeholder.
    // Este teste falha propositalmente enquanto DOMINIO_PUBLICO não for trocado
    // por um domínio real em lib/site.ts — é a trava, não um bug a esconder.
    expect(DOMINIO_PUBLICO.endsWith(".invalid")).toBe(false);
  });
});

describe("REPOSITORIO_PUBLICO", () => {
  it("não pode conter .invalid — é a trava que bloqueia publicação sem repositório público real", () => {
    // Mesmo espírito da trava de DOMINIO_PUBLICO: a página de metodologia
    // promete proveniência via histórico do git de um repositório público
    // que ainda não existe. Este teste falha propositalmente enquanto
    // REPOSITORIO_PUBLICO não for trocado por uma URL real em lib/site.ts.
    expect(REPOSITORIO_PUBLICO.includes(".invalid")).toBe(false);
  });
});
