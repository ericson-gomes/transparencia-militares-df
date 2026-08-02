import type {
  CarreiraPcdf,
  ChaveCorporacao,
  LadoComparador,
  LadoResolvido,
  ProjecaoAno,
  ResultadoComparador,
} from "../tipos";
import { CHAVE_CARGO_POR_GRUPO, NOME_EXIBIDO_POR_GRUPO } from "../gruposCargoPcdf";
import { liquidoMilitar, liquidoPcdf } from "../liquido";
import { simularTrajetoria } from "./simulador";

/**
 * A PCDF não tem histórico de mudança de interstício documentado: uma única
 * janela de vigência cobre 1996 até hoje (mesma lacuna já reconhecida no
 * comparador de trajetória anterior — ver spec 2026-07-31, §5).
 */
const VIGENCIA_UNICA_PCDF = "199601";

const ANOS_PROJETADOS = [1, 2, 3, 4, 5];

const NOME_CORPORACAO: Record<ChaveCorporacao, string> = { pmdf: "PMDF", cbmdf: "CBMDF" };

type DadosResolucao = {
  remuneracaoMilitarAtual: Record<string, number>;
  soldoMilitarAtual: Record<string, number>;
  carreiraPcdf: CarreiraPcdf;
};

function historicoDoCargo(intersticioAnosPorClasse: { nome: string; intersticioAnos: number }[]) {
  return intersticioAnosPorClasse.map((classe) => ({
    origem: classe.nome,
    vigenciaInicio: VIGENCIA_UNICA_PCDF,
    vigenciaFim: null,
    intersticioAnos: classe.intersticioAnos,
  }));
}

/**
 * Resolve um lado (militar ou PCDF) pro líquido mínimo garantido de hoje —
 * não o bruto. Lado militar é lookup direto no posto informado (não
 * simulado), com contribuição sobre o soldo (não a remuneração total, ver
 * `lib/liquido.ts`). Lado PCDF simula a classe alcançada pelo interstício a
 * partir do ano de ingresso, com contribuição IPREV-DF sobre o subsídio.
 * `salarioHojeCentavos` é sempre líquido — o comparador não trabalha mais
 * com bruto em nenhum ponto, por decisão do usuário.
 */
export function resolverLado(
  lado: LadoComparador,
  anoIngresso: number,
  anoAtual: number,
  dados: DadosResolucao,
): LadoResolvido {
  if (lado.tipo === "militar") {
    const brutoCentavos = dados.remuneracaoMilitarAtual[lado.posto] ?? 0;
    const soldoCentavos = dados.soldoMilitarAtual[lado.posto] ?? 0;
    const { liquidoCentavos } = liquidoMilitar(soldoCentavos, brutoCentavos);
    return {
      nome: NOME_CORPORACAO[lado.corporacao],
      salarioHojeCentavos: liquidoCentavos,
      rotuloHoje: lado.posto,
    };
  }

  const chaveCargo = CHAVE_CARGO_POR_GRUPO[lado.grupo];
  const cargo = dados.carreiraPcdf[chaveCargo];
  const degraus = cargo.classes.map((classe) => classe.nome);
  const salarios = Object.fromEntries(
    cargo.classes.map((classe) => [classe.nome, classe.salarioCentavos]),
  );
  const passos = simularTrajetoria(
    degraus,
    salarios,
    historicoDoCargo(cargo.classes),
    anoIngresso,
    anoAtual,
  ).filter((passo) => !passo.projetado);
  const atual = passos[passos.length - 1];
  const { liquidoCentavos } = liquidoPcdf(atual.salarioCentavos);

  return {
    nome: "PCDF",
    salarioHojeCentavos: liquidoCentavos,
    rotuloHoje: `${NOME_EXIBIDO_POR_GRUPO[lado.grupo]} — ${atual.degrau}`,
  };
}

export function calcularComparacao(
  ladoA: LadoComparador,
  ladoB: LadoComparador,
  anoIngresso: number,
  anoAtual: number,
  dados: DadosResolucao,
): ResultadoComparador {
  const resolvidoA = resolverLado(ladoA, anoIngresso, anoAtual, dados);
  const resolvidoB = resolverLado(ladoB, anoIngresso, anoAtual, dados);
  const diferencaMensalCentavos = resolvidoA.salarioHojeCentavos - resolvidoB.salarioHojeCentavos;

  const projecao: ProjecaoAno[] = ANOS_PROJETADOS.map((anos) => ({
    anos,
    acumuladoCentavos: diferencaMensalCentavos * 12 * anos,
  }));

  return { ladoA: resolvidoA, ladoB: resolvidoB, diferencaMensalCentavos, projecao };
}
