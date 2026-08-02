"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import estilos from "./Topo.module.css";

// Âncoras da página raiz do site (ericsongomes.com.br) — este componente
// mora dentro de /calculadora, então usam <a> normal, nunca next/link: o
// basePath só prefixa link/rota desta própria app, e essas seções não
// existem aqui. "Calculadora" é a exceção — é rota desta app, via Link.
const SECOES_SITE = [
  { href: "/#sobre", rotulo: "Sobre" },
  { href: "/#pauta", rotulo: "A pauta" },
  { href: "/#apoio", rotulo: "Apoio" },
];

export function Topo() {
  const [aberto, setAberto] = useState(false);

  // O menu ocupa a tela inteira; deixar a página rolar por baixo dele faz o
  // visitante fechar o menu num lugar diferente de onde abriu.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <>
      <header className={estilos.topo}>
        <a className={estilos.marca} href="/">
          <span className={estilos.nome}>Ericson Gomes</span>
          <span className={estilos.posto}>2º Sargento · CBMDF</span>
        </a>

        <div className={estilos.dir}>
          <nav className={estilos.nav}>
            {SECOES_SITE.map((secao) => (
              <a key={secao.href} href={secao.href}>
                {secao.rotulo}
              </a>
            ))}
            <Link href="/">Calculadora</Link>
          </nav>
          <button
            type="button"
            className={estilos.botaoMenu}
            onClick={() => setAberto((valor) => !valor)}
            aria-expanded={aberto}
            aria-controls="menu-movel"
          >
            {aberto ? "Fechar" : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="menu-movel"
        className={estilos.painel}
        data-aberto={aberto}
        aria-hidden={!aberto}
      >
        <nav className={estilos.painelNav}>
          {SECOES_SITE.map((secao) => (
            <a key={secao.href} href={secao.href} onClick={() => setAberto(false)}>
              {secao.rotulo}
            </a>
          ))}
          <Link href="/" onClick={() => setAberto(false)}>
            Calculadora
          </Link>
        </nav>
      </div>
    </>
  );
}
