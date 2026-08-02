import { describe, expect, it } from "vitest";
import { dimensoes, paraDadosCard, textoDoCard } from "./card";
import { DOMINIO_PUBLICO } from "./site";
import type { ResultadoComparador } from "./tipos";

describe("dimensoes", () => {
  it("usa 1080x1920 no formato story", () => {
    expect(dimensoes("story")).toEqual({ largura: 1080, altura: 1920 });
  });

  it("usa 1080x1350 no formato feed", () => {
    expect(dimensoes("feed")).toEqual({ largura: 1080, altura: 1350 });
  });
});

describe("paraDadosCard", () => {
  it("usa o acumulado de 5 anos (última linha da projeção) como número principal", () => {
    const resultado: ResultadoComparador = {
      ladoA: {
        nome: "PCDF",
        salarioHojeCentavos: 2344038,
        rotuloHoje: "Agente — Especial",
      },
      ladoB: {
        nome: "CBMDF",
        salarioHojeCentavos: 1206503,
        rotuloHoje: "2º SARGENTO",
      },
      diferencaMensalCentavos: 1137535,
      projecao: [
        { anos: 1, acumuladoCentavos: 1137535 * 12 },
        { anos: 2, acumuladoCentavos: 1137535 * 24 },
        { anos: 3, acumuladoCentavos: 1137535 * 36 },
        { anos: 4, acumuladoCentavos: 1137535 * 48 },
        { anos: 5, acumuladoCentavos: 1137535 * 60 },
      ],
    };
    const dados = paraDadosCard(resultado, "PCDF", "CBMDF");
    expect(dados.acumuladoCincoAnosCentavos).toBe(1137535 * 60);
    expect(dados.rotuloLadoA).toBe("PCDF");
    expect(dados.rotuloLadoB).toBe("CBMDF");
    expect(dados.salarioLadoACentavos).toBe(2344038);
    expect(dados.salarioLadoBCentavos).toBe(1206503);
  });
});

describe("textoDoCard", () => {
  const DADOS = {
    rotuloLadoA: "PCDF",
    rotuloLadoB: "CBMDF",
    salarioLadoACentavos: 2344038,
    salarioLadoBCentavos: 1206503,
    diferencaMensalCentavos: 1137535,
    acumuladoCincoAnosCentavos: 1137535 * 60,
  };

  it("monta o texto sem qualquer menção a candidatura, voto, urna ou eleição", () => {
    const texto = textoDoCard(DADOS);
    expect(texto.join(" ").toLowerCase()).not.toMatch(
      /voto|urna|candidat|deputad|elei[çc][ãa]o|partido/,
    );
  });

  it("inclui o valor de 5 anos formatado e o domínio público", () => {
    const texto = textoDoCard(DADOS);
    expect(texto).toContain(DOMINIO_PUBLICO);
    expect(texto.join(" ")).toContain("R$ 682.521,00");
  });

  it("não trava com diferença negativa — mostra o valor absoluto, atribui a direção certa", () => {
    const texto = textoDoCard({
      ...DADOS,
      diferencaMensalCentavos: -1137535,
      acumuladoCincoAnosCentavos: -1137535 * 60,
    });
    expect(texto.join(" ")).toContain("R$ 682.521,00");
    expect(texto.join(" ")).toContain("é o que CBMDF ganha a mais");
  });
});
