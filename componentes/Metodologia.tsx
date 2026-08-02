import Link from "next/link";
import { carregarProveniencia } from "@/lib/dados";
import { REPOSITORIO_PUBLICO } from "@/lib/site";
import { CHAVES_EXIBIDAS, DESCRICOES } from "@/lib/metodologia";
import estilos from "./Metodologia.module.css";

export function Metodologia() {
  const proveniencia = carregarProveniencia();

  return (
    <main className={estilos.pagina}>
      <Link href="/" className={estilos.voltar}>
        ← Voltar ao comparador
      </Link>

      <header className={estilos.introducao}>
        <p className={estilos.eyebrow}>PM, bombeiros e PCDF do DF · metodologia</p>
        <h1 className={estilos.titulo}>De onde vem cada número</h1>
        <p className={estilos.resumo}>
          Este comparador não pede para ser acreditado — ele mostra o
          documento por trás de cada valor. Esta página existe para ser
          atacada: cada número aparece aqui ligado ao arquivo que o origina,
          junto das premissas e limitações que o método declara.
        </p>
      </header>

      <section className={estilos.secao}>
        <h2 className={estilos.tituloSecao}>Proveniência de cada número</h2>
        <p>
          Os arquivos abaixo estão versionados no{" "}
          <a href={REPOSITORIO_PUBLICO} target="_blank" rel="noreferrer">
            repositório público deste comparador
          </a>
          , em <code>data/raw/</code>. Se o órgão de origem tirar o documento
          do ar, a cópia usada neste cálculo e a data em que foi obtida
          continuam provadas pelo histórico do git.
        </p>
        <div className={estilos.tabelaWrap}>
          <table className={estilos.tabela}>
            <thead>
              <tr>
                <th>Número</th>
                <th>O que é</th>
                <th>Arquivo de origem</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {CHAVES_EXIBIDAS.map((chave) => {
                const registro = proveniencia.registros[chave];
                return (
                  <tr key={chave}>
                    <td>
                      <code>{chave}</code>
                    </td>
                    <td data-rotulo="O que é">{DESCRICOES[chave]}</td>
                    <td data-rotulo="Arquivo de origem">
                      <code>{registro.arquivo}</code>
                    </td>
                    <td data-rotulo="Observação">{registro.observacao}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={estilos.secao}>
        <h2 className={estilos.tituloSecao}>Por que PMDF e CBMDF dividem os mesmos números</h2>
        <p>
          O comparador serve às duas corporações militares do Distrito
          Federal com a mesma tabela de remuneração. Isso não é aproximação:
          a remuneração dos militares do DF é a mesma, por lei.
        </p>
        <ul className={estilos.lista}>
          <li>
            A Lei 10.486/2002 dispõe sobre a remuneração dos militares do
            DF — <strong>Polícia Militar e Corpo de Bombeiros Militar</strong>{" "}
            no mesmo artigo 1º — e remete a um único conjunto de anexos, na
            redação vigente da Lei 15.395/2026.
          </li>
          <li>
            A Secretaria de Estado de Economia do DF publica uma tabela de
            escalonamento vertical por corporação. As duas foram baixadas e
            comparadas célula a célula, nos 16 postos: <strong>não há uma
            diferença</strong>. O ETL refaz essa comparação a cada build e
            aborta antes de gravar qualquer arquivo se um dia divergirem.
          </li>
          <li>
            Essa conferência automática usa as duas tabelas da SEEC/DF na
            vigência janeiro/2020 — os únicos arquivos, um por corporação,
            que o site encontrou disponíveis. O valor efetivamente exibido
            na tela vem de um documento de vigência janeiro/2026 publicado
            só pelo CBMDF; não existe um equivalente específico da PMDF
            arquivado para essa vigência. O comparador aplica o mesmo
            número às duas corporações com base na identidade provada em
            2020, não numa nova conferência feita em 2026.
          </li>
        </ul>
      </section>

      <section className={estilos.secao}>
        <h2 className={estilos.tituloSecao}>Como a classe da PCDF é simulada</h2>
        <p>
          A patente informada no formulário é a que você digita — não
          simulada. Só o lado da PCDF é uma simulação: a partir do ano de
          ingresso informado, o comparador avança pelas classes da carreira
          (3ª, 2ª, 1ª, Especial) usando o interstício mínimo confirmado no
          Decreto 7.652/2011, art. 3º — 3 anos para sair da 3ª classe e 5 anos
          por classe daí em diante — até chegar na classe que a coorte de
          mesmo ano de ingresso já alcançaria hoje.
        </p>
        <ul className={estilos.lista}>
          <li>
            <strong>Não afirma equivalência formal de posto ou cargo</strong>{" "}
            entre PM/CBM e PCDF (sargento não é agente, por definição): a
            comparação é só por coorte de ingresso — tempo de serviço x
            salário.
          </li>
          <li>
            O interstício mínimo é piso, não é promoção automática: o mesmo
            art. 3º do Decreto 7.652/2011 também exige avaliação de
            desempenho satisfatória e curso de aperfeiçoamento concluído. O
            comparador assume os dois cumpridos no prazo mínimo.
          </li>
          <li>
            A PCDF não tem histórico de mudança de interstício documentado —
            uma única janela de vigência cobre 1996 até hoje, então a regra
            vigente hoje é aplicada também retroativamente.
          </li>
        </ul>
      </section>

      <section className={estilos.secao}>
        <h2 className={estilos.tituloSecao}>O que cada número inclui</h2>
        <p>
          Os dois lados da comparação não são calculados da mesma forma —
          isso não invalida o comparador, mas precisa ficar declarado. O que
          segue é o valor bruto de cada lado antes dos descontos — nenhum
          dos dois aparece na tela: é só o que entra na conta do líquido
          mínimo garantido, explicado na próxima seção.
        </p>
        <ul className={estilos.lista}>
          <li>
            O lado militar usa a coluna TOTAL do documento de remuneração:
            soldo somado a Complemento de Soldo e a um conjunto de
            gratificações e adicionais (APG, AOM, GFR, GCEF, VPE, GRV e
            ACP) — este último varia por posto porque depende dos cursos
            que o militar já concluiu. Auxílio-alimentação e auxílio-moradia
            (AMSD/AMCD) ficam de fora: são colunas separadas no mesmo
            documento, pagas à parte.
          </li>
          <li>
            O lado da PCDF usa o subsídio, parcela única por desenho
            constitucional (art. 39, §4º, CF): a lei não permite acréscimo
            separado por gratificação dentro dele, então não há como
            decompô-lo do mesmo jeito que a coluna TOTAL militar.
          </li>
          <li>
            É a comparação mais defensável disponível entre uma remuneração
            itemizada e um subsídio de parcela única — mas não são o mesmo
            tipo de número. Quem quiser conferir rubrica a rubrica precisa
            abrir os documentos de origem, listados na tabela de
            proveniência acima.
          </li>
          <li>
            A projeção de 1 a 5 anos mantém a classe da PCDF constante,
            além da patente militar — não simula a progressão futura da
            coorte da PCDF. Essa premissa específica é conservadora, não
            inflada: se a classe da PCDF também avançar nesse período, a
            diferença real tende a ficar maior que a projetada aqui, não
            menor.
          </li>
          <li>
            O Anexo IV da Lei 15.395/2026 — fonte do subsídio de Agente de
            Polícia, Escrivão de Polícia, Papiloscopista Policial e Agente
            de Custódia — traz, na alínea b, o &ldquo;QUADRO II: VALOR DO
            SUBSÍDIO PARA OS OFICIAIS INVESTIGADORES DE POLÍCIA E
            PAPILOSCOPISTAS&rdquo;. O rótulo vem de uma tentativa, na mesma
            lei, de renomear esses cargos para &ldquo;Oficial Investigador
            de Polícia&rdquo;; a mudança foi vetada (art. 4º, inciso IV, e
            todo o art. 4º-A da alteração à Lei 11.361/2006). Os cargos
            continuam em vigor sob nomes próprios pela Lei 14.724/2023, que
            usa &ldquo;Agente Policial de Custódia&rdquo; onde este
            comparador usa a forma abreviada &ldquo;Agente de
            Custódia&rdquo; — mesmo cargo, grafia mais curta.
          </li>
          <li>
            O lado da PCDF nunca é escolhido no formulário — a PCDF não usa
            este site, é só o sistema de referência da comparação. O cargo
            de referência é sempre o grupo &ldquo;Demais cargos&rdquo;
            (Agente de Polícia, Escrivão de Polícia, Papiloscopista
            Policial, Agente de Custódia), que têm exatamente o mesmo
            subsídio (Anexo IV, Quadro II, da Lei 15.395/2026) — escolher
            qualquer um dos quatro daria o mesmo resultado. O Delegado de
            Polícia, que tem tabela própria e maior (Anexo III), fica fora
            desta comparação.
          </li>
        </ul>
      </section>

      <section className={estilos.secao}>
        <h2 className={estilos.tituloSecao}>Salário líquido mínimo garantido</h2>
        <p>
          Todo valor deste comparador — os dois salários de hoje, a
          diferença mensal e a projeção de 1 a 5 anos — é líquido, nunca
          bruto. E é um líquido <strong>mínimo garantido</strong>: zero
          dependentes, zero deduções extras — o cenário de maior imposto
          possível, logo de líquido mais baixo possível. Qualquer
          dependente ou dedução real só aumenta o que a pessoa recebe,
          nunca diminui, então é um piso defensável sem depender de
          suposição sobre a vida de quem está calculando.
        </p>
        <ul className={estilos.lista}>
          <li>
            <strong>Lado militar:</strong> a contribuição (10,5% de pensão
            militar — Lei 3.765/1960, art. 3º-A, alíquota fixada pela Lei
            13.954/2019 — mais 2% de assistência médico-hospitalar — Lei
            10.486/2002, art. 33, §1º) incide sobre o <strong>soldo</strong>,
            não a remuneração total. É um achado desta etapa: a primeira
            versão do cálculo usava a remuneração total por engano, e um
            militar da ativa apontou o erro pelo valor real do próprio
            contracheque — a Lei 10.486/2002, art. 36, §2º, confirma que a
            base de cálculo é &ldquo;o soldo sobre o qual forem calculadas
            as suas contribuições&rdquo;, não outra rubrica.
          </li>
          <li>
            O imposto de renda do lado militar também é calculado só sobre
            o soldo nesta conta — não a remuneração total. Essa é uma
            <strong> premissa declarada, não confirmada em fonte primária
            própria</strong>: parte do princípio de que as demais rubricas
            (VPE e gratificações) têm natureza indenizatória, como já
            reconhecido pela Justiça para uma gratificação equivalente em
            outro estado (GRAM, no Rio de Janeiro). Bate com o relato do
            contracheque real que motivou a correção acima, mas não há
            confirmação específica para a VPE do DF. Se essa premissa for
            desmentida, o líquido militar calculado aqui fica menor do que
            o mostrado.
          </li>
          <li>
            <strong>Lado PCDF:</strong> a contribuição ao IPREV-DF (14% —
            Lei Complementar 970/2020) incide sobre o subsídio até o teto
            do RGPS, não sobre o valor inteiro. O comparador usa R$
            8.157,41 como teto — valor vigente em 2025, <strong>ainda não
            confirmado especificamente para 2026</strong>.
          </li>
          <li>
            Acima do teto do RGPS existe ainda o regime de previdência
            complementar (DF-Previcom), com alíquota entre 4,5% e 8,5%
            escolhida pela própria pessoa, possivelmente opcional conforme
            a data de ingresso. Esse componente fica <strong>fora da
            conta</strong> de propósito: contribuir para ele só reduz o
            líquido, nunca aumenta — omiti-lo mantém o número um piso
            verdadeiro, sem precisar resolver uma escolha que a lei deixa
            para cada pessoa.
          </li>
          <li>
            O imposto de renda usa a tabela de retenção na fonte mensal
            vigente a partir de janeiro de 2026 (Lei 15.191/2025) — a de
            declaração anual, que é outra tabela, não entra nesta conta.
          </li>
        </ul>
      </section>

      <section className={estilos.secao}>
        <h2 className={estilos.tituloSecao}>Limitações declaradas</h2>
        <ul className={estilos.lista}>
          <li>
            A tabela de projeção em 1 a 5 anos mantém a patente militar
            informada constante — o comparador não sabe há quanto tempo você
            está nela, então não estima quando a próxima promoção acontece.
            Se ela vier antes do fim da janela projetada, a diferença real
            acumulada é menor do que a mostrada.
          </li>
          <li>
            Delegado de Polícia tem tabela de subsídio própria e maior
            (Anexo III) que os demais cargos comuns da PCDF (Anexo IV,
            Quadro II) — o comparador nunca usa a do Delegado, mesmo que o
            resultado real da pessoa fosse maior com ela.
          </li>
        </ul>
      </section>

      <footer className={estilos.rodape}>
        <Link href="/" className={estilos.voltar}>
          ← Voltar ao comparador
        </Link>
      </footer>
    </main>
  );
}
