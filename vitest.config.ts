import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mesmo alias do `tsconfig.json`. Sem ele, os testes de componente não
  // resolvem os imports `@/lib/...` que os próprios componentes usam.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
  },
});
