from decimal import Decimal
from pathlib import Path

import pytest

from etl.remuneracao import LinhaRemuneracao, parse

FIXTURES = Path(__file__).parent / "fixtures"


def carregar(nome: str) -> tuple[str, dict[str, LinhaRemuneracao]]:
    vigencia, linhas = parse((FIXTURES / nome).read_text(encoding="utf-8"))
    return vigencia, {linha.posto: linha for linha in linhas}


def test_layout_2020_le_vigencia_e_valores() -> None:
    vigencia, por_posto = carregar("remuneracao_2020.txt")
    assert vigencia == "202001"
    coronel = por_posto["CORONEL"]
    assert coronel.soldo == Decimal("3195.04")
    assert coronel.vpe == Decimal("9098.96")
    assert coronel.total == Decimal("19090.92")
    assert coronel.aux_alimentacao == Decimal("850.00")


def test_layout_2026_le_vigencia_e_valores() -> None:
    vigencia, por_posto = carregar("remuneracao_2026.txt")
    assert vigencia == "202601"
    coronel = por_posto["CORONEL"]
    assert coronel.soldo == Decimal("4800.00")
    assert coronel.vpe == Decimal("15452.11")
    assert coronel.total == Decimal("29756.60")
    assert coronel.aux_alimentacao == Decimal("850.00")


def test_aux_alimentacao_nao_confunde_com_aux_moradia() -> None:
    """Em 2026 o auxílio-alimentação é a antepenúltima coluna, não a última."""
    _, por_posto = carregar("remuneracao_2026.txt")
    assert por_posto["SOLDADO 2ª CLASSE"].aux_alimentacao == Decimal("850.00")
    assert por_posto["CORONEL"].aux_alimentacao == Decimal("850.00")


def test_normaliza_nomes_entre_layouts() -> None:
    _, de_2020 = carregar("remuneracao_2020.txt")
    _, de_2026 = carregar("remuneracao_2026.txt")
    comuns = {"CORONEL", "TENENTE-CORONEL", "3º SARGENTO", "SOLDADO 2ª CLASSE"}
    assert comuns <= set(de_2020)
    assert comuns <= set(de_2026)


def test_reajuste_do_soldo_foi_uniforme() -> None:
    """Todos os postos foram multiplicados pelo mesmo fator de 2020 para 2026."""
    _, de_2020 = carregar("remuneracao_2020.txt")
    _, de_2026 = carregar("remuneracao_2026.txt")
    for posto in ("CORONEL", "3º SARGENTO", "SOLDADO 2ª CLASSE"):
        razao = de_2026[posto].soldo / de_2020[posto].soldo
        assert abs(razao - Decimal("1.50233")) < Decimal("0.0001"), posto


def test_texto_irreconhecivel_levanta_erro() -> None:
    with pytest.raises(ValueError, match="layout"):
        parse("documento qualquer sem tabela")
