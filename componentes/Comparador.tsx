"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  carregarCarreiraPcdf,
  carregarMetadados,
  carregarRemuneracaoMilitarAtual,
  carregarSoldoMilitarAtual,
} from "@/lib/dados";
import { CORPORACOES_MILITARES } from "@/lib/corporacoesMilitares";
import { ORDEM_POSTOS, PATENTES_TETO, grupoPcdfDaPatente } from "@/lib/postosMilitares";
import { CORPORACAO_PADRAO, temaDaCorporacao } from "@/lib/tema";
import { calcularComparacao } from "@/lib/comparador/calculo";
import { paraDadosCard } from "@/lib/card";
import type { ChaveCorporacao, LadoComparador } from "@/lib/tipos";
import { ComparadorFormulario } from "./ComparadorFormulario";
import { ResultadoComparador } from "./ResultadoComparador";
import { Card } from "./Card";
import { formatarDataExtensa } from "./formatoMes";
import estilos from "./Comparador.module.css";

const carreiraPcdf = carregarCarreiraPcdf();
const remuneracaoMilitarAtual = carregarRemuneracaoMilitarAtual();
const soldoMilitarAtual = carregarSoldoMilitarAtual();
const metadados = carregarMetadados();
// Ano de corte dos dados, do próprio JSON: declarar ingresso depois disso não
// tem número pra sustentar. Sai daqui e não de `new Date()` pra não divergir
// entre o HTML pré-renderizado e a hidratação na virada de ano.
const anoDoCorte = Number(metadados.geradoEm.slice(0, 4));
const ANO_MINIMO = 1970;

const PATENTES = Object.keys(remuneracaoMilitarAtual).sort(
  (a, b) => ORDEM_POSTOS.indexOf(a) - ORDEM_POSTOS.indexOf(b),
);

const DADOS_RESOLUCAO = { remuneracaoMilitarAtual, soldoMilitarAtual, carreiraPcdf };

export function Comparador() {
  const [corporacao, setCorporacao] = useState<ChaveCorporacao>(CORPORACAO_PADRAO);
  const [patente, setPatente] = useState("");
  const [anoIngresso, setAnoIngresso] = useState<number | "">("");

  const corporacaoAtual = CORPORACOES_MILITARES.find((item) => item.chave === corporacao)!;

  // O acento do site segue a corporação escolhida no formulário — mesma
  // chave que o site usa no seletor do topo.
  useEffect(() => {
    document.documentElement.dataset.corporacao = temaDaCorporacao(corporacao);
  }, [corporacao]);

  // O sentido do campo de ano muda entre "ingresso" e "virou a patente-teto"
  // (ver lib/postosMilitares.ts). Trocar de patente atravessando essa
  // fronteira invalida o que já tinha sido digitado — limpa em vez de
  // deixar um valor com o sentido errado silenciosamente na conta.
  function mudarPatente(novaPatente: string) {
    if (PATENTES_TETO.has(patente) !== PATENTES_TETO.has(novaPatente)) {
      setAnoIngresso("");
    }
    setPatente(novaPatente);
  }

  const anoValido =
    anoIngresso !== "" && anoIngresso >= ANO_MINIMO && anoIngresso <= anoDoCorte;
  const pronto = patente !== "" && anoValido;

  const ladoMilitar: LadoComparador = { tipo: "militar", corporacao, posto: patente };
  // O lado da PCDF nunca é escolhido pelo usuário — a PCDF é só o sistema de
  // comparação, ninguém de lá usa o site. O cargo de referência depende da
  // patente: Capitão e acima comparam com Delegado, o resto com "Demais
  // cargos" (ver lib/postosMilitares.ts).
  const ladoPcdf: LadoComparador = { tipo: "pcdf", grupo: grupoPcdfDaPatente(patente) };

  const resultado = useMemo(() => {
    if (!pronto) return null;
    return calcularComparacao(
      ladoMilitar,
      ladoPcdf,
      anoIngresso as number,
      anoDoCorte,
      DADOS_RESOLUCAO,
    );
  }, [corporacao, patente, anoIngresso, pronto]);

  return (
    <main className={estilos.pagina}>
      <header className={estilos.introducao}>
        <p className={estilos.eyebrow}>PM, bombeiros e PCDF do DF · comparador de carreira</p>
        <h1 className={estilos.titulo}>
          Quanto a Polícia Civil ganha na mesma coorte de ingresso que o{" "}
          {corporacaoAtual.gentilico}
        </h1>
        <p className={estilos.resumo}>
          A partir da patente atual e do ano de ingresso, veja quanto um
          policial civil que entrou na mesma época já ganha hoje — líquido,
          descontados contribuição e imposto de renda — e o que essa
          diferença representa em 1 a 5 anos. A comparação é só por tempo de
          serviço: não afirma equivalência de posto ou cargo entre as
          carreiras.
        </p>
      </header>

      <ComparadorFormulario
        corporacao={corporacao}
        patente={patente}
        patentes={PATENTES}
        anoIngresso={anoIngresso}
        anoMaximo={anoDoCorte}
        aoMudarCorporacao={setCorporacao}
        aoMudarPatente={mudarPatente}
        aoMudarAnoIngresso={setAnoIngresso}
      />

      {resultado === null ? (
        <p className={estilos.espera}>
          Escolha a patente atual e o ano de ingresso acima para ver a comparação.
        </p>
      ) : (
        <div className={estilos.resultado}>
          <ResultadoComparador resultado={resultado} />
          <section className={estilos.compartilhar}>
            <div className={estilos.compartilharTexto}>
              <h2 className={estilos.tituloCompartilhar}>Compartilhe o seu número</h2>
              <p className={estilos.textoCompartilhar}>
                Baixe um card com a projeção de 5 anos e publique nas suas
                redes — sem cadastro, sem envio de dado nenhum. A imagem é
                gerada aqui no seu navegador.
              </p>
            </div>
            <Card dados={paraDadosCard(resultado, resultado.ladoA.nome, resultado.ladoB.nome)} />
          </section>
        </div>
      )}

      <footer className={estilos.rodape}>
        <Link href="/metodologia" className={estilos.linkMetodologia}>
          Metodologia e fontes de cada número →
        </Link>
        <p className={estilos.dataCorte}>
          Dados atualizados em {formatarDataExtensa(metadados.geradoEm)}.
        </p>
      </footer>
    </main>
  );
}
