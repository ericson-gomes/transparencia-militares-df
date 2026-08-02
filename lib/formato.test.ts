import { describe, expect, it } from "vitest";
import { formatarCentavos } from "./formato";

describe("formatarCentavos", () => {
  it("formata em real brasileiro", () => {
    expect(formatarCentavos(37003)).toBe("R$ 370,03");
  });

  it("formata zero", () => {
    expect(formatarCentavos(0)).toBe("R$ 0,00");
  });

  it("formata milhares com separador", () => {
    expect(formatarCentavos(122003)).toBe("R$ 1.220,03");
  });
});
