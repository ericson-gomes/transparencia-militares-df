import { describe, expect, it } from "vitest";
import proveniencia from "../public/data/proveniencia.json";
import { CHAVES_EXIBIDAS, DESCRICOES } from "./metodologia";

describe("proveniência", () => {
  it("cobre todo número exibido na interface", () => {
    for (const chave of CHAVES_EXIBIDAS) {
      expect(proveniencia.registros).toHaveProperty(chave);
    }
  });

  it("aponta para arquivo versionado no repositório", () => {
    for (const registro of Object.values(proveniencia.registros)) {
      expect(registro.arquivo).toMatch(/^data\/raw\//);
    }
  });

  it("descreve cada chave exibida — nenhuma entra na tabela sem explicação", () => {
    for (const chave of CHAVES_EXIBIDAS) {
      expect(DESCRICOES[chave]).toBeTruthy();
    }
  });
});
