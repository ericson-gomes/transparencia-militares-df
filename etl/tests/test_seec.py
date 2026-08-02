"""Prova de que a remuneração da PMDF e a do CBMDF são a mesma.

Esse é o achado que sustenta a arquitetura: se as duas corporações têm a mesma
tabela, os blocos de congelamento, equiparação e auxílio valem igual para as
duas e não há número a recalcular — só o efetivo é por corporação. Um teste
frouxo aqui deixaria passar uma divergência real e publicaria número errado
para metade do público da ferramenta.

A prova vem por três caminhos independentes:

- as duas páginas da Secretaria de Economia do DF, comparadas célula a célula;
- o PDF que o próprio CBMDF publica, conferido contra a página da SEEC;
- os anexos da Lei 15.395/2026, que são a norma por trás das duas.
"""

from decimal import Decimal
from pathlib import Path

import pytest

from etl import tabelas_legais
from etl.remuneracao import extrair_texto
from etl.remuneracao import parse as parse_remuneracao
from etl.seec import carregar, parse
from etl.tabela_html import coletar_tabelas

RAIZ = Path(__file__).parents[2]
TABELA_PMDF = RAIZ / "data/raw/pmdf/tabela-remuneracao-pmdf-seec-202001.html"
TABELA_CBMDF = RAIZ / "data/raw/pmdf/tabela-remuneracao-cbmdf-seec-202001.html"
LEI_15395 = RAIZ / "data/raw/pmdf/lei-15395-2026.htm"
MP_1326 = RAIZ / "data/raw/pmdf/mp-1326-2025.htm"
PDF_2020 = RAIZ / "data/raw/remuneracao-2020-01.pdf"
PDF_2026 = RAIZ / "data/raw/remuneracao-2026-01.pdf"

POSTOS_ESPERADOS = {
    "CORONEL",
    "TENENTE-CORONEL",
    "MAJOR",
    "CAPITÃO",
    "1º TENENTE",
    "2º TENENTE",
    "ASPIRANTE A OFICIAL",
    "CADETE ÚLTIMO ANO",
    "CADETE 1º ANO",
    "SUBTENENTE",
    "1º SARGENTO",
    "2º SARGENTO",
    "3º SARGENTO",
    "CABO",
    "SOLDADO 1ª CLASSE",
    "SOLDADO 2ª CLASSE",
}


def test_as_duas_paginas_trazem_a_mesma_vigencia_e_os_mesmos_postos() -> None:
    vigencia_pmdf, pmdf = carregar(TABELA_PMDF)
    vigencia_cbmdf, cbmdf = carregar(TABELA_CBMDF)
    assert vigencia_pmdf == vigencia_cbmdf == "202001"
    assert set(pmdf) == set(cbmdf) == POSTOS_ESPERADOS


def test_remuneracao_da_pmdf_e_identica_a_do_cbmdf() -> None:
    """O achado central. Compara todos os campos, não só o soldo.

    Se um dia a lei desdobrar as tabelas por corporação, é aqui que o projeto
    fica sabendo — e o site precisa deixar de reaproveitar os blocos.
    """
    _, pmdf = carregar(TABELA_PMDF)
    _, cbmdf = carregar(TABELA_CBMDF)
    for posto in sorted(POSTOS_ESPERADOS):
        assert pmdf[posto] == cbmdf[posto], posto


def test_total_e_a_soma_das_parcelas_sem_alimentacao_nem_moradia() -> None:
    """`total` não embute auxílio — é o que torna a comparação com a PF honesta.

    A soma fecha a menos de um centavo, não exatamente: a página arredonda cada
    parcela (que sai de um percentual do soldo) e o total de forma independente,
    então 4 dos 16 postos divergem em R$ 0,01. É propriedade da fonte, não do
    parser. O projeto publica o `total` da página, nunca a soma recalculada.
    """
    _, pmdf = carregar(TABELA_PMDF)
    for posto, linha in sorted(pmdf.items()):
        assert abs(linha.parcelas() - linha.total) <= Decimal("0.01"), posto
        assert linha.aux_alimentacao == Decimal("850.00"), posto


def test_pagina_da_seec_confere_com_o_pdf_do_proprio_cbmdf() -> None:
    """Caminho independente: órgão distinto, formato distinto, mesmos valores."""
    _, seec = carregar(TABELA_CBMDF)
    vigencia, linhas = parse_remuneracao(extrair_texto(PDF_2020))
    assert vigencia == "202001"
    do_pdf = {linha.posto: linha for linha in linhas}
    for posto in sorted(POSTOS_ESPERADOS):
        assert seec[posto].soldo == do_pdf[posto].soldo, posto
        assert seec[posto].vpe == do_pdf[posto].vpe, posto
        assert seec[posto].aux_alimentacao == do_pdf[posto].aux_alimentacao, posto


def test_soldo_congelado_da_lei_bate_com_a_tabela_de_2020() -> None:
    """A coluna "até 30/11/2025" da lei é o mesmo valor de janeiro de 2020.

    É o que caracteriza o congelamento: a tabela legal atravessou a década
    inteira sem mudar de valor.
    """
    _, seec = carregar(TABELA_PMDF)
    da_lei = tabelas_legais.soldo(LEI_15395)
    for posto in sorted(POSTOS_ESPERADOS):
        assert da_lei[posto].por_vigencia["202511"] == seec[posto].soldo, posto


def test_soldo_e_vpe_novos_da_lei_batem_com_a_tabela_de_2026() -> None:
    _, linhas = parse_remuneracao(extrair_texto(PDF_2026))
    do_pdf = {linha.posto: linha for linha in linhas}
    soldo_lei = tabelas_legais.soldo(LEI_15395)
    vpe_lei = tabelas_legais.vpe(LEI_15395)
    for posto in sorted(POSTOS_ESPERADOS):
        assert soldo_lei[posto].por_vigencia["202601"] == do_pdf[posto].soldo, posto
        assert vpe_lei[posto].por_vigencia["202601"] == do_pdf[posto].vpe, posto


def test_tabela_legal_nao_desdobra_por_corporacao() -> None:
    """A norma nomeia um degrau só para as duas academias — não há tabela por corporação.

    Lê pelo parser, não por substring no HTML cru: o rótulo quebra em duas
    linhas no documento e a checagem literal passaria a impressão errada de
    ausência.
    """
    rotulos = {
        celula.upper()
        for tabela in coletar_tabelas(LEI_15395.read_text(encoding="latin-1"))
        for linha in tabela
        for celula in linha
    }
    assert any("ACADEMIA DE POLÍCIA MILITAR OU BOMBEIRO MILITAR" in rotulo for rotulo in rotulos)


def test_html_sem_tabela_levanta_erro() -> None:
    with pytest.raises(ValueError, match="layout"):
        parse("<html><body><p>Vigência: Janeiro/2020</p></body></html>")


def test_valor_ilegivel_levanta_erro_em_vez_de_virar_zero() -> None:
    """Degradação de layout tem que falhar alto, não virar zero silencioso."""
    linha = "<tr><td>Coronel</td><td>3.195,04</td><td>80%</td>" + "<td>xx</td>" * 11 + "</tr>"
    with pytest.raises(ValueError, match="não reconhecido"):
        parse(f"<p>Vigência: Janeiro/2020</p><table>{linha}</table>")


# --- A lei é a fonte, e o anexo certo dentro dela ---


def test_conversao_em_lei_nao_alterou_os_anexos() -> None:
    """A MP 1.326/2025 virou a Lei 15.395/2026 sem mexer nas tabelas.

    É o que autoriza os números apurados sob a MP a continuarem valendo. Se a
    conversão tivesse alterado um valor, este teste apontaria exatamente onde.
    """
    for leitor in (tabelas_legais.soldo, tabelas_legais.vpe):
        da_lei = leitor(LEI_15395)
        da_mp = leitor(MP_1326)
        assert set(da_lei) == set(da_mp)
        for posto in sorted(da_lei):
            assert da_lei[posto].por_vigencia == da_mp[posto].por_vigencia, posto


def test_le_o_anexo_dos_militares_do_df_e_nao_o_dos_ex_territorios() -> None:
    """A regressão mais cara possível neste módulo, e ela já aconteceu uma vez.

    A mesma lei traz duas tabelas de soldo: o Anexo I (militares do DF) e o
    Anexo V (ex-Territórios Federais). As duas se chamam "TABELA I - SOLDO", e
    no HTML da lei o título do Anexo I vem quebrado por tags — uma âncora por
    título casa o Anexo V e publica o soldo de outra carreira sem erro nenhum.
    Coronel dos ex-Territórios em nov/2025 é R$ 4.352,85; do DF, R$ 3.195,04.
    """
    soldo = tabelas_legais.soldo(LEI_15395)
    assert soldo["CORONEL"].por_vigencia["202511"] == Decimal("3195.04")
    assert soldo["CORONEL"].por_vigencia["202511"] != Decimal("4352.85")
    assert soldo["CORONEL"].por_vigencia["202601"] == Decimal("4800.00")


def test_reajuste_veio_em_dois_degraus_nao_um() -> None:
    """dez/2025 e jan/2026 são degraus distintos.

    O congelamento termina em 30/11/2025, que é onde a série do bloco 1 para —
    dezembro já é mês reajustado, não mês congelado.
    """
    coronel = tabelas_legais.soldo(LEI_15395)["CORONEL"].por_vigencia
    assert coronel["202511"] < coronel["202512"] < coronel["202601"]
    assert coronel["202512"] == Decimal("4153.55")


def test_anexo_inexistente_falha_alto() -> None:
    with pytest.raises(ValueError, match="nenhuma tabela"):
        tabelas_legais._tabela_do_anexo("<p>sem anexo</p>", ("XPTO", "1.234"))


def test_nao_confunde_anexo_i_com_anexo_i_a_da_mesma_lei() -> None:
    """Anexo I e Anexo I-A são os dois "da Lei 10.486" e os dois trazem soldo.

    O que separa é a designação. Casar só pelo número da lei devolveria a
    tabela dos ex-Territórios com a mesma naturalidade.
    """
    assert tabelas_legais.ANEXO_SOLDO == ("I", "10.486")
    coronel = tabelas_legais.soldo(LEI_15395)["CORONEL"].por_vigencia["202511"]
    assert coronel == Decimal("3195.04")
