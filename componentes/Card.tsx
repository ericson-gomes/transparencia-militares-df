"use client";

import { useEffect, useRef, useState } from "react";
import { dimensoes, textoDoCard, type DadosCard, type Formato } from "@/lib/card";
import estilos from "./Card.module.css";

// Libre Franklin é a fonte do site; o desenho espera document.fonts.ready
// antes de redesenhar, senão o canvas sai na fallback do sistema.
const FAMILIA_FONTE =
  '"Libre Franklin", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Espelho de app/tokens.css (valores do tema claro — o card não segue o
// dark mode do site, mesma decisão já tomada no card antigo). O canvas não
// enxerga CSS, então os hex ficam duplicados aqui — ao mexer no token, mexa
// aqui também.
const CORES = {
  fundo: "#ffffff",
  texto: "#212529",
  textoSuave: "#495057",
  textoMudo: "#707070",
  linha: "#dee2e6",
};

// Mesmo acento que o site usa por corporação (--cbm-500/--pm-500 em
// app/tokens.css). Sem cor própria pra "PCDF" — o sistema de tema do site
// é binário (PM/CBM); um card com os dois lados PCDF cai no neutro.
const ACENTO_POR_ROTULO: Record<string, string> = {
  CBMDF: "#c8102e",
  PMDF: "#245a94",
};
const ACENTO_NEUTRO = "#212529";

function acentoDoCard(dados: DadosCard): string {
  return ACENTO_POR_ROTULO[dados.rotuloLadoA] ?? ACENTO_POR_ROTULO[dados.rotuloLadoB] ?? ACENTO_NEUTRO;
}

type Props = {
  dados: DadosCard;
};

/**
 * Card compartilhável: desenha em canvas (sem chamada de rede, sem fonte
 * remota) e permite baixar ou compartilhar o resultado como PNG. Os valores
 * já chegam em líquido mínimo garantido — o comparador não trabalha mais com
 * bruto em nenhum ponto. A explicação da premissa do líquido não cabe numa
 * imagem, fica só na tela.
 */
export function Card({ dados }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formato, setFormato] = useState<Formato>("feed");
  const [gerando, setGerando] = useState(false);
  // Compartilhar com arquivo só existe em navegador móvel; no desktop a
  // bandeja do sistema ou não existe ou não aceita anexo, e aí resta baixar.
  const [podeCompartilhar, setPodeCompartilhar] = useState(false);

  useEffect(() => {
    const teste = new File([new Blob([], { type: "image/png" })], "t.png", {
      type: "image/png",
    });
    setPodeCompartilhar(
      typeof navigator.canShare === "function" && navigator.canShare({ files: [teste] }),
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    const { largura, altura } = dimensoes(formato);
    canvas.width = largura;
    canvas.height = altura;
    desenharCard(ctx, dados, formato);

    // O primeiro desenho pode pegar a fonte ainda não carregada; quando ela
    // chegar, redesenha. Sem isso o card sai na fallback do sistema.
    let cancelado = false;
    void document.fonts.ready.then(() => {
      if (!cancelado) desenharCard(ctx, dados, formato);
    });
    return () => {
      cancelado = true;
    };
  }, [dados, formato]);

  function comoPng(): Promise<Blob | null> {
    const canvas = canvasRef.current;
    if (canvas === null) return Promise.resolve(null);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  const nomeArquivo = `comparador-${formato}.png`;

  function baixar(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function acaoPrincipal() {
    setGerando(true);
    try {
      const blob = await comoPng();
      if (blob === null) return;

      const arquivo = new File([blob], nomeArquivo, { type: "image/png" });
      if (podeCompartilhar && navigator.canShare({ files: [arquivo] })) {
        // Não vai direto pro Instagram: o app não expõe endereço que aceite
        // imagem vinda de página web. A bandeja do sistema é o mais perto —
        // o Instagram aparece nela, com o PNG já anexado.
        await navigator.share({ files: [arquivo] });
        return;
      }
      baixar(blob);
    } catch (erro) {
      // Cancelar a bandeja levanta AbortError. Não é falha.
      if (erro instanceof Error && erro.name === "AbortError") return;
      const blob = await comoPng();
      if (blob !== null) baixar(blob);
    } finally {
      setGerando(false);
    }
  }

  async function baixarDireto() {
    setGerando(true);
    const blob = await comoPng();
    setGerando(false);
    if (blob !== null) baixar(blob);
  }

  return (
    <div className={estilos.wrapper}>
      <div className={estilos.controles}>
        <div className={estilos.grupo}>
          <span className={estilos.rotulo} id="rotulo-formato-card">
            Formato
          </span>
          <div className={estilos.opcoes} role="group" aria-labelledby="rotulo-formato-card">
            <button
              type="button"
              className={estilos.opcao}
              data-ativo={formato === "feed"}
              onClick={() => setFormato("feed")}
            >
              Feed <span className={estilos.medida}>1080×1350</span>
            </button>
            <button
              type="button"
              className={estilos.opcao}
              data-ativo={formato === "story"}
              onClick={() => setFormato("story")}
            >
              Story <span className={estilos.medida}>1080×1920</span>
            </button>
          </div>
        </div>

        <div className={estilos.acoes}>
          <button
            type="button"
            className={estilos.baixar}
            onClick={acaoPrincipal}
            disabled={gerando}
          >
            {gerando ? "Gerando…" : podeCompartilhar ? "Compartilhar" : "Baixar"}
          </button>
          {podeCompartilhar && (
            <button
              type="button"
              className={estilos.baixarAlt}
              onClick={baixarDireto}
              disabled={gerando}
            >
              Baixar
            </button>
          )}
        </div>
      </div>

      <div className={estilos.previa}>
        <canvas
          ref={canvasRef}
          className={estilos.canvas}
          role="img"
          aria-label={`Card compartilhável no formato ${formato}, com a diferença projetada em 5 anos entre ${dados.rotuloLadoA} e ${dados.rotuloLadoB}`}
        />
      </div>
    </div>
  );
}

/**
 * Desenha o card completo no contexto informado. Só usa a font stack do
 * sistema — sem @font-face, sem fonte remota — e é geometria e texto puros:
 * nenhuma chamada de rede, nenhuma imagem externa.
 */
function desenharCard(ctx: CanvasRenderingContext2D, dados: DadosCard, formato: Formato): void {
  const { largura, altura } = dimensoes(formato);
  const [kicker, valor, contexto, mensal, proveniencia, endereco] = textoDoCard(dados);
  const acento = acentoDoCard(dados);

  ctx.clearRect(0, 0, largura, altura);
  ctx.fillStyle = CORES.fundo;
  ctx.fillRect(0, 0, largura, altura);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const margem = Math.round(largura * 0.095);
  const larguraUtil = largura - margem * 2;

  const tamanhoKicker = Math.round(altura * 0.019);
  ctx.font = `600 ${tamanhoKicker}px ${FAMILIA_FONTE}`;
  ctx.fillStyle = CORES.textoMudo;
  const yKicker = Math.round(altura * 0.1);
  ctx.fillText(kicker.toUpperCase(), margem, yKicker);

  const tamanhoHero = ajustarFonteParaLargura(ctx, valor, larguraUtil, Math.round(altura * 0.1), 700);
  ctx.fillStyle = CORES.texto;
  const yHero = Math.round(altura * 0.32);
  ctx.fillText(valor, margem, yHero);

  const tamanhoLegendaHero = Math.round(altura * 0.019);
  ctx.font = `500 ${tamanhoLegendaHero}px ${FAMILIA_FONTE}`;
  ctx.fillStyle = CORES.textoMudo;
  const yLegendaHero = yHero + Math.round(tamanhoLegendaHero * 1.8);
  ctx.fillText("líquido, projetado em 5 anos, se o gap de hoje se mantiver", margem, yLegendaHero);

  const tamanhoContexto = Math.round(altura * 0.021);
  ctx.font = `400 ${tamanhoContexto}px ${FAMILIA_FONTE}`;
  ctx.fillStyle = CORES.textoSuave;
  const alturaLinhaContexto = Math.round(tamanhoContexto * 1.5);
  let y = yLegendaHero + Math.round(alturaLinhaContexto * 1.6);
  for (const linha of quebrarLinhas(ctx, contexto, larguraUtil)) {
    ctx.fillText(linha, margem, y);
    y += alturaLinhaContexto;
  }

  y += Math.round(alturaLinhaContexto * 0.5);
  for (const linha of quebrarLinhas(ctx, mensal, larguraUtil)) {
    ctx.fillText(linha, margem, y);
    y += alturaLinhaContexto;
  }

  // Rodapé montado de baixo para cima: o endereço é o motivo de o card
  // existir — quem recebe precisa saber onde conferir o próprio número — e
  // por isso vai grande, com a proveniência acima dele em corpo pequeno.
  const margemBase = Math.round(altura * 0.07);
  const tamanhoEndereco = Math.round(altura * 0.026);
  const tamanhoRodape = Math.round(altura * 0.014);

  const yEndereco = altura - margemBase;
  const yProveniencia = yEndereco - Math.round(tamanhoEndereco * 1.5);
  const yHairline = yProveniencia - Math.round(tamanhoRodape * 2.2);

  ctx.strokeStyle = CORES.linha;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margem, yHairline);
  ctx.lineTo(largura - margem, yHairline);
  ctx.stroke();

  ctx.font = `400 ${tamanhoRodape}px ${FAMILIA_FONTE}`;
  ctx.fillStyle = CORES.textoMudo;
  ctx.fillText(proveniencia, margem, yProveniencia);

  ctx.font = `700 ${tamanhoEndereco}px ${FAMILIA_FONTE}`;
  ctx.fillStyle = CORES.texto;
  ctx.fillText(endereco, margem, yEndereco);

  const alturaFaixa = Math.max(6, Math.round(altura * 0.009));
  ctx.fillStyle = acento;
  ctx.fillRect(0, altura - alturaFaixa, largura, alturaFaixa);
}

function ajustarFonteParaLargura(
  ctx: CanvasRenderingContext2D,
  texto: string,
  larguraMaxima: number,
  tamanhoInicial: number,
  peso: number,
): number {
  let tamanho = tamanhoInicial;
  ctx.font = `${peso} ${tamanho}px ${FAMILIA_FONTE}`;
  while (ctx.measureText(texto).width > larguraMaxima && tamanho > 48) {
    tamanho -= 2;
    ctx.font = `${peso} ${tamanho}px ${FAMILIA_FONTE}`;
  }
  return tamanho;
}

function quebrarLinhas(ctx: CanvasRenderingContext2D, texto: string, larguraMaxima: number): string[] {
  const palavras = texto.split(" ");
  const linhas: string[] = [];
  let linhaAtual = "";

  for (const palavra of palavras) {
    const proximaLinha = linhaAtual === "" ? palavra : `${linhaAtual} ${palavra}`;
    if (ctx.measureText(proximaLinha).width > larguraMaxima && linhaAtual !== "") {
      linhas.push(linhaAtual);
      linhaAtual = palavra;
    } else {
      linhaAtual = proximaLinha;
    }
  }
  if (linhaAtual !== "") linhas.push(linhaAtual);
  return linhas;
}
