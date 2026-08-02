import { describe, expect, it } from "vitest";
import { formatarDataExtensa, formatarMesExtenso } from "./formatoMes";

describe("formatarMesExtenso", () => {
  it("converte AAAAMM para mês por extenso", () => {
    expect(formatarMesExtenso("201503")).toBe("março de 2015");
  });

  it("converte dezembro corretamente (índice 11)", () => {
    expect(formatarMesExtenso("202512")).toBe("dezembro de 2025");
  });
});

describe("formatarDataExtensa", () => {
  it("converte um ISO 8601 com hora para data por extenso", () => {
    expect(formatarDataExtensa("2026-06-27T14:00:00Z")).toBe("27 de junho de 2026");
  });

  it("converte um ISO 8601 sem hora", () => {
    expect(formatarDataExtensa("2026-01-05")).toBe("5 de janeiro de 2026");
  });
});
