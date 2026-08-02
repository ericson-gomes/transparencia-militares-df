import { describe, expect, it } from "vitest";
import { NOME_EXIBIDO_POR_GRUPO } from "./gruposCargoPcdf";

// Os quatro nomes completos e reais dos cargos que "demais" funde — os
// mesmos usados em `carreira-pcdf.json` e em `componentes/Metodologia.tsx`.
const NOMES_COMPLETOS_DOS_QUATRO_CARGOS = [
  "Agente de Polícia",
  "Escrivão de Polícia",
  "Papiloscopista Policial",
  "Agente de Custódia",
];

describe("NOME_EXIBIDO_POR_GRUPO", () => {
  it("o rótulo de 'demais cargos' lista os quatro nomes completos, não abreviados", () => {
    // Trava contra a forma abreviada antiga ("Agente, Escrivão,
    // Papiloscopista ou Agente de Custódia"), onde "Agente" sozinho pode ser
    // lido como se cobrisse "Agente de Custódia" — não são a mesma coisa.
    for (const nome of NOMES_COMPLETOS_DOS_QUATRO_CARGOS) {
      expect(NOME_EXIBIDO_POR_GRUPO.demais).toContain(nome);
    }
  });

  it("o rótulo de 'demais cargos' nunca é igual a um único nome de cargo", () => {
    // Regra do CLAUDE.md/plano: nunca exibir um cargo específico quando o
    // grupo é "demais" — o rótulo tem que listar os quatro.
    for (const nome of NOMES_COMPLETOS_DOS_QUATRO_CARGOS) {
      expect(NOME_EXIBIDO_POR_GRUPO.demais).not.toBe(nome);
    }
  });

  it("o rótulo de 'delegado' é um cargo só, e não coincide com o de 'demais'", () => {
    expect(NOME_EXIBIDO_POR_GRUPO.delegado).not.toBe(NOME_EXIBIDO_POR_GRUPO.demais);
    for (const nome of NOMES_COMPLETOS_DOS_QUATRO_CARGOS) {
      expect(NOME_EXIBIDO_POR_GRUPO.delegado).not.toBe(nome);
    }
  });
});
