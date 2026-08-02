import json
from decimal import Decimal
from pathlib import Path

import pytest

from etl.carreira_pcdf import carregar

FONTE = Path(__file__).parents[2] / "data/raw/carreira-pcdf.json"

CARGOS_ESPERADOS = {"delegado", "agente", "escrivao", "papiloscopista", "custodia"}


@pytest.mark.skipif(not FONTE.exists(), reason="carreira da PCDF ainda não transcrita")
def test_cobre_os_cinco_cargos_do_escopo() -> None:
    assert set(carregar(FONTE)) == CARGOS_ESPERADOS


@pytest.mark.skipif(not FONTE.exists(), reason="carreira da PCDF ainda não transcrita")
def test_toda_classe_tem_intersticio_nao_negativo() -> None:
    for cargo in carregar(FONTE).values():
        for classe in cargo.classes:
            assert classe.intersticio_anos >= 0, (cargo.nome, classe.nome)


@pytest.mark.skipif(not FONTE.exists(), reason="carreira da PCDF ainda não transcrita")
def test_ultima_classe_de_cada_cargo_nao_progride() -> None:
    for cargo in carregar(FONTE).values():
        assert cargo.classes[-1].intersticio_anos == 0, cargo.nome


@pytest.mark.skipif(not FONTE.exists(), reason="carreira da PCDF ainda não transcrita")
def test_regra_geral_de_progressao_e_tres_e_cinco_anos() -> None:
    """3 anos pra sair da 3ª Classe, 5 anos por classe daí em diante — Lei
    9.264/1996 + Decreto 7.652/2011. Confirmado, ao contrário do salário."""
    for cargo in carregar(FONTE).values():
        anos = [classe.intersticio_anos for classe in cargo.classes]
        assert anos == [3, 5, 5, 0], cargo.nome


@pytest.mark.skipif(not FONTE.exists(), reason="carreira da PCDF ainda não transcrita")
def test_arquivo_registra_proveniencia() -> None:
    bruto = json.loads(FONTE.read_text(encoding="utf-8"))
    assert bruto["fonte"].startswith("data/raw/")
    assert "9.264" in bruto["lei"]


def test_salario_da_classe_especial_bate_com_o_anexo_iii_e_iv_da_lei_15395_2026() -> None:
    """Anexo III (Delegado) e Anexo IV Quadro II (Agente/Escrivão/Papiloscopista/
    Custódia) da Lei 15.395/2026 — valores a partir de 1º/01/2026. Os quatro
    cargos comuns dividem a mesma tabela (Quadro II), Delegado tem a dele
    (Anexo III) — ver spec 2026-07-31 para a leitura do HTML da lei.

    Verifica as 4 classes de cada cargo: 3ª, 2ª, 1ª e Especial."""
    cargos = carregar(FONTE)

    # Delegado: Anexo III da Lei 15.395/2026 — todas as 4 classes
    delegado_salarios = [
        Decimal("26690.15"),  # 3ª Classe
        Decimal("27703.52"),  # 2ª Classe
        Decimal("32382.34"),  # 1ª Classe
        Decimal("38872.66"),  # Especial
    ]
    for classe, salario_esperado in zip(cargos["delegado"].classes, delegado_salarios):
        assert classe.salario == salario_esperado, f"Delegado {classe.nome}"

    # Agente, Escrivão, Papiloscopista, Custódia: Anexo IV Quadro II da Lei 15.395/2026 — todas as 4 classes
    comuns_salarios = [
        Decimal("13794.41"),  # 3ª Classe
        Decimal("14593.70"),  # 2ª Classe
        Decimal("17523.06"),  # 1ª Classe
        Decimal("23440.38"),  # Especial
    ]
    comuns = ["agente", "escrivao", "papiloscopista", "custodia"]
    for chave in comuns:
        for classe, salario_esperado in zip(cargos[chave].classes, comuns_salarios):
            assert classe.salario == salario_esperado, f"{chave} {classe.nome}"
