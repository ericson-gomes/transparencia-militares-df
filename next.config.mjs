/** @type {import("next").NextConfig} */

// O site vive em ericsongomes.com.br/calculadora, subcaminho de um site que já
// existe na raiz. Com basePath, o Next prefixa sozinho os assets (/_next/...)
// e os href de next/link — não precisa (nem pode) hardcodar "/calculadora"
// nos componentes.
//
// O que o basePath NÃO prefixa é string crua: `url()` em CSS e caminho montado
// à mão dentro de `style`. Por isso o valor sai daqui por env, e quem monta
// caminho de arquivo em `public/` usa `caminhoPublico()` de lib/caminho.ts.
const basePath = "/calculadora";

const nextConfig = {
  output: "export",
  // Achado 11 da revisão final: sem isso, o export gera out/metodologia.html
  // em vez de out/metodologia/index.html — link interno funciona, mas acesso
  // direto a /metodologia/ depende do host fazer clean-URL, e nem todo host
  // estático simples faz.
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
