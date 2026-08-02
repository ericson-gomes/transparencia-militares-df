import { formatarCentavos } from "@/lib/formato";
import type { ResultadoComparador as TipoResultado } from "@/lib/tipos";
import estilos from "./ResultadoComparador.module.css";

type Props = {
  resultado: TipoResultado;
};

/**
 * Todo valor aqui já vem líquido mínimo garantido de `calcularComparacao` —
 * o comparador não trabalha mais com bruto em nenhum ponto, por decisão do
 * usuário. Ver `lib/liquido.ts` e a metodologia pras premissas do cálculo.
 */
export function ResultadoComparador({ resultado }: Props) {
  const { ladoA, ladoB, diferencaMensalCentavos, projecao } = resultado;
  // Nome de quem ganha mais — dito direto, em vez de uma convenção de sinal
  // (“positivo é X”) que confunde quando o número exibido é negativo.
  const ladoQueGanhaMais = diferencaMensalCentavos >= 0 ? ladoA.nome : ladoB.nome;
  const diferencaAbsolutaCentavos = Math.abs(diferencaMensalCentavos);

  return (
    <section className={estilos.bloco}>
      <h2 className={estilos.titulo}>Hoje (líquido mínimo garantido)</h2>

      <ul className={estilos.linhas}>
        <li className={estilos.linha}>
          <span className={estilos.rotuloLinha}>{ladoA.nome}</span>
          <span className={estilos.detalheLinha}>{ladoA.rotuloHoje}</span>
          <span className={estilos.valorLinha}>{formatarCentavos(ladoA.salarioHojeCentavos)}</span>
        </li>
        <li className={estilos.linha}>
          <span className={estilos.rotuloLinha}>{ladoB.nome}</span>
          <span className={estilos.detalheLinha}>{ladoB.rotuloHoje}</span>
          <span className={estilos.valorLinha}>{formatarCentavos(ladoB.salarioHojeCentavos)}</span>
        </li>
      </ul>

      <div className={estilos.diferenca}>
        <p className={estilos.diferencaValor}>{formatarCentavos(diferencaAbsolutaCentavos)}</p>
        <p className={estilos.diferencaRotulo}>de diferença líquida por mês, a favor de {ladoQueGanhaMais}</p>
      </div>

      <div>
        <h3 className={estilos.titulo}>Se essa diferença continuar</h3>
        <div className={estilos.tabelaWrap}>
          <table className={estilos.tabela}>
            <thead>
              <tr>
                <th>Em</th>
                <th>Diferença acumulada, a favor de {ladoQueGanhaMais}</th>
              </tr>
            </thead>
            <tbody>
              {projecao.map((linha) => (
                <tr key={linha.anos}>
                  <td>
                    {linha.anos} {linha.anos === 1 ? "ano" : "anos"}
                  </td>
                  <td>{formatarCentavos(Math.abs(linha.acumuladoCentavos))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={estilos.nota}>
          Premissa: nenhum dos dois lados muda de patente/classe nesses anos. Líquido mínimo
          garantido: zero dependentes, zero deduções extras — é um piso, não uma média. Veja a
          metodologia pra premissas de cada número.
        </p>
      </div>
    </section>
  );
}
