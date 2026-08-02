import Link from "next/link";
import estilos from "./Rodape.module.css";

export function Rodape() {
  return (
    <footer className={estilos.rodape}>
      <div className={estilos.col}>
        <span className={estilos.nomeRodape}>Ericson Gomes</span>
        <span className={estilos.sub}>2º Sargento · CBMDF</span>
      </div>

      <div className={estilos.col}>
        <a href="https://instagram.com/gomes_ericson" target="_blank" rel="noreferrer noopener">
          @gomes_ericson
        </a>
        <a href="https://wa.me/5561992000139" target="_blank" rel="noreferrer noopener">
          (61) 99200-0139
        </a>
        <a href="mailto:ericsondiogenes@yahoo.com.br">ericsondiogenes@yahoo.com.br</a>
      </div>

      <div className={estilos.col}>
        <Link href="/">Calculadora</Link>
        <Link href="/metodologia">Metodologia</Link>
        <a href="/">Site principal</a>
      </div>

      <div className={estilos.base}>
        <p className={estilos.aviso}>
          Ferramenta pública de transparência. Os números citados vêm de fonte
          primária, com metodologia aberta, e o código é auditável.
        </p>
      </div>
    </footer>
  );
}
