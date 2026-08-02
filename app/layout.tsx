import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Libre_Franklin } from "next/font/google";
import { DOMINIO_PUBLICO } from "@/lib/site";
import { CORPORACAO_PADRAO, temaDaCorporacao } from "@/lib/tema";
import { Topo } from "@/componentes/Topo";
import { Rodape } from "@/componentes/Rodape";
import "./globals.css";

// Mesma família do site na raiz do domínio. Uma só, com o peso separando
// título de corpo — se divergir daqui, /calculadora passa a parecer outro site.
const franklin = Libre_Franklin({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--fonte-texto",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fonte-mono",
  display: "swap",
});

const TITULO = "Comparador PM/CBM x PCDF — remuneração por coorte de ingresso";
const DESCRICAO =
  "Comparador público que mostra, a partir da patente atual e do ano de "
  + "ingresso, quanto um policial civil do DF que entrou na mesma época já "
  + "ganha hoje — e o que essa diferença representa em 1 a 5 anos.";

export const metadata: Metadata = {
  // Barra final proposital: sem ela, a resolução de URL relativa (RFC 3986)
  // trata "calculadora" como arquivo e descarta o subcaminho ao montar
  // metadata absoluta — com ela, resolve como diretório e mantém
  // "/calculadora/..." no resultado.
  metadataBase: new URL(`https://${DOMINIO_PUBLICO}/`),
  title: TITULO,
  description: DESCRICAO,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "./",
    siteName: "Comparador PM/CBM x PCDF",
    title: TITULO,
    description: DESCRICAO,
    // TODO: falta desenhar uma imagem de compartilhamento pro comparador
    // atual. O og.jpg antigo (public/og.jpg) é da calculadora removida —
    // não citar aqui até existir uma nova. Quando houver imagem, o caminho
    // vai SEM barra inicial de propósito: o metadataBase já termina em
    // /calculadora/, então "og.jpg" resolve para /calculadora/og.jpg — com
    // barra inicial resolveria para a raiz do domínio, onde mora o site,
    // que é outro projeto e outra imagem.
  },
  twitter: {
    // "summary" até existir imagem de compartilhamento nova — ver TODO
    // acima. "summary_large_image" sem imagem degrada bem na prática, mas
    // o tipo declarado deixaria de bater com o que a página de fato tem.
    card: "summary",
    title: TITULO,
    description: DESCRICAO,
  },
};

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-corporacao={temaDaCorporacao(CORPORACAO_PADRAO)}
      className={`${franklin.variable} ${mono.variable}`}
    >
      <body>
        <Topo />
        {children}
        <Rodape />
      </body>
    </html>
  );
}
