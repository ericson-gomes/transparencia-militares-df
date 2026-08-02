import type { DegrauIntersticio, PassoTrajetoria } from "../tipos";

export function intersticioHoje(historico: DegrauIntersticio[], origem: string): number {
  const vigente = historico.find((d) => d.origem === origem && d.vigenciaFim === null);
  if (vigente === undefined) {
    throw new Error(`sem interstício vigente registrado para "${origem}"`);
  }
  return vigente.intersticioAnos;
}

/**
 * Simula a sequência de classes alcançadas a partir do ano de ingresso, sempre
 * com o interstício vigente hoje — é o único modelo que sobra depois que o
 * comparador passou a pedir a patente militar atual direto em vez de simulá-
 * la: só o lado PCDF continua sendo simulado, e ela não tem histórico de
 * mudança de interstício documentado (uma única janela de vigência cobre
 * 1996 até hoje), então não havia um segundo modelo a manter.
 */
export function simularTrajetoria(
  degraus: string[],
  salarioCentavosPorDegrau: Record<string, number>,
  historico: DegrauIntersticio[],
  anoIngresso: number,
  anoAtual: number,
): PassoTrajetoria[] {
  const passos: PassoTrajetoria[] = [];
  let ano = anoIngresso;
  for (let indice = 0; indice < degraus.length; indice++) {
    const degrau = degraus[indice];
    passos.push({
      degrau,
      ano,
      salarioCentavos: salarioCentavosPorDegrau[degrau] ?? 0,
      projetado: ano > anoAtual,
    });
    if (indice === degraus.length - 1) break;
    ano += intersticioHoje(historico, degrau);
  }
  return passos;
}
