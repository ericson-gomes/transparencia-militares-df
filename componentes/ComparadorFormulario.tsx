import type { ChangeEvent } from "react";
import type { ChaveCorporacao } from "@/lib/tipos";
import { CORPORACOES_MILITARES } from "@/lib/corporacoesMilitares";
import { NOME_PATENTE_TETO, PATENTES_TETO } from "@/lib/postosMilitares";
import estilos from "./ComparadorFormulario.module.css";

const ANO_MINIMO = 1970;

type Props = {
  corporacao: ChaveCorporacao;
  patente: string;
  patentes: string[];
  anoIngresso: number | "";
  /** Ano de corte dos dados: não faz sentido declarar ingresso depois dele. */
  anoMaximo: number;
  aoMudarCorporacao: (chave: ChaveCorporacao) => void;
  aoMudarPatente: (patente: string) => void;
  aoMudarAnoIngresso: (ano: number | "") => void;
};

export function ComparadorFormulario({
  corporacao,
  patente,
  patentes,
  anoIngresso,
  anoMaximo,
  aoMudarCorporacao,
  aoMudarPatente,
  aoMudarAnoIngresso,
}: Props) {
  function mudarAno(evento: ChangeEvent<HTMLInputElement>) {
    const bruto = evento.target.value;
    aoMudarAnoIngresso(bruto === "" ? "" : Number(bruto));
  }

  const anoForaDaFaixa =
    anoIngresso !== "" && (anoIngresso < ANO_MINIMO || anoIngresso > anoMaximo);

  // Subtenente e Coronel são o teto da própria trilha — o ano que pedimos
  // aqui não é o de ingresso na corporação, é o ano em que a pessoa chegou
  // nessa patente (ver lib/postosMilitares.ts).
  const eTeto = PATENTES_TETO.has(patente);
  const rotuloAno = eTeto
    ? `Em que ano você se tornou ${NOME_PATENTE_TETO[patente]}`
    : "Ano de ingresso";
  const ajudaAno = anoForaDaFaixa
    ? `Use um ano entre ${ANO_MINIMO} e ${anoMaximo}.`
    : eTeto
      ? `${NOME_PATENTE_TETO[patente]} é o teto da carreira — não tem patente acima pra promover. Por isso perguntamos o ano em que você chegou nela, não o de ingresso na corporação.`
      : "Sem o ano, não dá pra saber em que classe a PCDF estaria.";

  return (
    <form className={estilos.formulario} onSubmit={(evento) => evento.preventDefault()}>
      <div className={estilos.campo} data-preenchido="true">
        <span className={estilos.passo} aria-hidden="true">
          01
        </span>
        <span className={estilos.rotulo} id="rotulo-corporacao">
          Corporação
        </span>
        <div className={estilos.opcoes} role="group" aria-labelledby="rotulo-corporacao">
          {CORPORACOES_MILITARES.map((opcao) => (
            <button
              key={opcao.chave}
              type="button"
              className={estilos.opcao}
              aria-pressed={opcao.chave === corporacao}
              onClick={() => aoMudarCorporacao(opcao.chave)}
            >
              {opcao.sigla}
            </button>
          ))}
        </div>
      </div>

      <label className={estilos.campo} data-preenchido={patente !== ""}>
        <span className={estilos.passo} aria-hidden="true">
          02
        </span>
        <span className={estilos.rotulo}>Patente ou graduação atual</span>
        <select
          className={estilos.select}
          value={patente}
          onChange={(evento) => aoMudarPatente(evento.target.value)}
        >
          <option value="" disabled>
            Selecione…
          </option>
          {patentes.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </label>

      <label className={estilos.campo} data-preenchido={anoIngresso !== ""}>
        <span className={estilos.passo} aria-hidden="true">
          03
        </span>
        <span className={estilos.rotulo}>{rotuloAno}</span>
        <input
          className={estilos.input}
          type="number"
          inputMode="numeric"
          placeholder="2012"
          min={ANO_MINIMO}
          max={anoMaximo}
          step={1}
          value={anoIngresso}
          onChange={mudarAno}
          aria-invalid={anoForaDaFaixa}
          aria-describedby="ajuda-ano-comparador"
        />
        <span className={estilos.ajuda} id="ajuda-ano-comparador">
          {ajudaAno}
        </span>
      </label>

      <p className={estilos.aviso}>
        Nada é enviado nem salvo: o cálculo roda inteiramente no seu navegador.
      </p>
    </form>
  );
}
