import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResultadoComparador } from "./ResultadoComparador";
import type { ResultadoComparador as TipoResultado } from "@/lib/tipos";

const RESULTADO_PCDF_GANHA_MAIS: TipoResultado = {
  ladoA: {
    nome: "PCDF",
    salarioHojeCentavos: 1707503,
    rotuloHoje: "Agente de Polícia, Escrivão de Polícia, Papiloscopista Policial ou Agente de Custódia — Especial",
  },
  ladoB: {
    nome: "CBMDF",
    salarioHojeCentavos: 1183943,
    rotuloHoje: "2º SARGENTO",
  },
  diferencaMensalCentavos: 523560,
  projecao: [
    { anos: 1, acumuladoCentavos: 523560 * 12 },
    { anos: 2, acumuladoCentavos: 523560 * 24 },
    { anos: 3, acumuladoCentavos: 523560 * 36 },
    { anos: 4, acumuladoCentavos: 523560 * 48 },
    { anos: 5, acumuladoCentavos: 523560 * 60 },
  ],
};

const RESULTADO_MILITAR_GANHA_MAIS: TipoResultado = {
  ...RESULTADO_PCDF_GANHA_MAIS,
  ladoB: { ...RESULTADO_PCDF_GANHA_MAIS.ladoB, salarioHojeCentavos: 2888709 },
  diferencaMensalCentavos: 1707503 - 2888709,
  projecao: RESULTADO_PCDF_GANHA_MAIS.projecao.map((p) => ({
    ...p,
    acumuladoCentavos: (1707503 - 2888709) * 12 * p.anos,
  })),
};

function renderizar(resultado: TipoResultado): string {
  return renderToStaticMarkup(<ResultadoComparador resultado={resultado} />);
}

describe("ResultadoComparador", () => {
  it("mostra o rótulo, o detalhe e o líquido de hoje dos dois lados", () => {
    const html = renderizar(RESULTADO_PCDF_GANHA_MAIS);
    expect(html).toContain("2º SARGENTO");
    expect(html).toContain("PCDF");
    expect(html).toContain("Especial");
    expect(html).toContain("R$");
    expect(html.toLowerCase()).toContain("líquido mínimo garantido");
  });

  it("mostra as cinco linhas de projeção", () => {
    const html = renderizar(RESULTADO_PCDF_GANHA_MAIS);
    for (const anos of [1, 2, 3, 4, 5]) {
      expect(html).toContain(`${anos} ano`);
    }
  });

  it("não menciona bruto em lugar nenhum — só líquido", () => {
    const html = renderizar(RESULTADO_PCDF_GANHA_MAIS);
    expect(html.toLowerCase()).not.toContain("bruto");
  });

  it("não trava quando o lado B ganha mais — mostra o valor absoluto, atribui a favor de CBMDF, não de PCDF", () => {
    const html = renderizar(RESULTADO_MILITAR_GANHA_MAIS);
    expect(html).not.toContain("-R$"); // nunca mostra sinal negativo, só atribuição por texto
    expect(html).toContain("a favor de CBMDF");
    expect(html).not.toContain("a favor de PCDF");
  });

  it("quando o lado A ganha mais, atribui a diferença a ele, não ao lado B", () => {
    const html = renderizar(RESULTADO_PCDF_GANHA_MAIS);
    expect(html).toContain("a favor de PCDF");
    expect(html).not.toContain("a favor de CBMDF");
  });
});
