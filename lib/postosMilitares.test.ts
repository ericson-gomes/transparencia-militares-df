import { describe, expect, it } from "vitest";
import { grupoPcdfDaPatente, PATENTES_TETO } from "./postosMilitares";

describe("grupoPcdfDaPatente", () => {
  it("compara com Delegado a partir de Capitão", () => {
    expect(grupoPcdfDaPatente("CAPITÃO")).toBe("delegado");
    expect(grupoPcdfDaPatente("MAJOR")).toBe("delegado");
    expect(grupoPcdfDaPatente("TENENTE-CORONEL")).toBe("delegado");
    expect(grupoPcdfDaPatente("CORONEL")).toBe("delegado");
  });

  it("compara com Demais cargos abaixo de Capitão", () => {
    expect(grupoPcdfDaPatente("1º TENENTE")).toBe("demais");
    expect(grupoPcdfDaPatente("2º TENENTE")).toBe("demais");
    expect(grupoPcdfDaPatente("SUBTENENTE")).toBe("demais");
    expect(grupoPcdfDaPatente("2º SARGENTO")).toBe("demais");
    expect(grupoPcdfDaPatente("SOLDADO 2ª CLASSE")).toBe("demais");
  });
});

describe("PATENTES_TETO", () => {
  it("marca só Subtenente e Coronel como teto de trilha", () => {
    expect(PATENTES_TETO.has("SUBTENENTE")).toBe(true);
    expect(PATENTES_TETO.has("CORONEL")).toBe(true);
    expect(PATENTES_TETO.has("1º SARGENTO")).toBe(false);
    expect(PATENTES_TETO.has("TENENTE-CORONEL")).toBe(false);
  });
});
