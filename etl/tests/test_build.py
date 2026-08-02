import json
from dataclasses import replace
from pathlib import Path

import pytest

from etl.build import (
    TABELA_SEEC_PMDF,
    conferir_identidade_remuneratoria,
    montar_carreira_pcdf,
    montar_remuneracao_militar_atual,
    montar_soldo_militar_atual,
)
from etl.build import (
    main as executar_build,
)
from etl.proveniencia import Proveniencia
from etl.remuneracao import extrair_texto
from etl.remuneracao import parse as parse_remuneracao
from etl.seec import LinhaSeec
from etl.seec import carregar as carregar_seec

RAIZ = Path(__file__).parents[2]
DADOS_RAW = RAIZ / "data/raw"

CHAVES_PROVENIENCIA_OBRIGATORIAS = {
    "remuneracao.identidade",
    "pcdf.carreira",
    "militar.remuneracaoAtual",
    "militar.soldoAtual",
}


# --- Proveniência ---


def test_registro_guarda_arquivo_e_observacao() -> None:
    prov = Proveniencia()
    prov.registrar("pcdf.carreira", "data/raw/carreira-pcdf.json", "classes e interstício")
    assert prov.como_dicionario()["pcdf.carreira"]["arquivo"].startswith("data/raw/")


def test_exigir_completo_rejeita_chave_sem_fonte() -> None:
    prov = Proveniencia()
    prov.registrar("pcdf.carreira", "data/raw/x.json", "")
    with pytest.raises(ValueError, match="sem proveniência"):
        prov.exigir_completo({"pcdf.carreira", "militar.remuneracaoAtual"})


def test_exigir_completo_aceita_conjunto_coberto() -> None:
    prov = Proveniencia()
    prov.registrar("a", "data/raw/x.json", "")
    prov.registrar("b", "data/raw/y.json", "")
    prov.exigir_completo({"a", "b"})


# --- Carreira PCDF e remuneração militar ---


def test_montar_carreira_pcdf_cobre_os_cinco_cargos() -> None:
    carreira = montar_carreira_pcdf(Proveniencia())
    assert set(carreira) == {"delegado", "agente", "escrivao", "papiloscopista", "custodia"}
    assert carreira["delegado"]["classes"][-1]["salarioCentavos"] == 3887266
    assert carreira["agente"]["classes"][-1]["salarioCentavos"] == 2344038


def test_montar_remuneracao_militar_atual_cobre_todo_posto() -> None:
    _, linhas_2026 = parse_remuneracao(extrair_texto(DADOS_RAW / "remuneracao-2026-01.pdf"))
    por_posto_2026 = {linha.posto: linha for linha in linhas_2026}

    remuneracao = montar_remuneracao_militar_atual(por_posto_2026, Proveniencia())

    assert remuneracao["CORONEL"] > 0
    assert remuneracao["SOLDADO 2ª CLASSE"] > 0
    assert all(isinstance(v, int) for v in remuneracao.values())


# --- Identidade PMDF/CBMDF ---


def test_identidade_remuneratoria_passa_com_os_dados_reais() -> None:
    conferir_identidade_remuneratoria()  # não deve levantar


def test_build_aborta_se_a_remuneracao_das_duas_divergir(monkeypatch: pytest.MonkeyPatch) -> None:
    """A trava que impede o comparador de continuar reaproveitando a mesma
    tabela de remuneração para as duas corporações.

    Adultera o soldo do Coronel só do lado da PMDF e confere que o build para,
    nomeando o posto que divergiu — não basta falhar, tem que dizer onde.
    """
    real = carregar_seec

    def com_coronel_adulterado(caminho: Path) -> tuple[str, dict[str, LinhaSeec]]:
        vigencia, linhas = real(caminho)
        if caminho == TABELA_SEEC_PMDF:
            coronel = linhas["CORONEL"]
            linhas = {**linhas, "CORONEL": replace(coronel, soldo=coronel.soldo + 1)}
        return vigencia, linhas

    monkeypatch.setattr("etl.build.carregar_seec", com_coronel_adulterado)
    with pytest.raises(ValueError, match="CORONEL"):
        conferir_identidade_remuneratoria()


# --- Build de ponta a ponta ---


def test_build_gera_os_json_com_sanidade(tmp_path: Path) -> None:
    """Grava em `tmp_path` (descartável), nunca em `public/data/`: `pytest` não pode
    sujar o working tree regravando `geradoEm` a cada rodada da suíte."""
    executar_build(tmp_path)

    carreira = json.loads((tmp_path / "carreira-pcdf.json").read_text(encoding="utf-8"))
    assert set(carreira) == {"delegado", "agente", "escrivao", "papiloscopista", "custodia"}
    for cargo in carreira.values():
        assert [c["intersticioAnos"] for c in cargo["classes"]] == [3, 5, 5, 0]
        assert all(c["salarioCentavos"] > 0 for c in cargo["classes"])

    remuneracao = json.loads(
        (tmp_path / "remuneracao-militar-atual.json").read_text(encoding="utf-8")
    )
    assert remuneracao["CORONEL"] > 0
    assert all(isinstance(v, int) for v in remuneracao.values())

    metadados = json.loads((tmp_path / "metadados.json").read_text(encoding="utf-8"))
    assert metadados["geradoEm"]

    proveniencia = json.loads((tmp_path / "proveniencia.json").read_text(encoding="utf-8"))
    assert CHAVES_PROVENIENCIA_OBRIGATORIAS <= set(proveniencia["registros"])
    for registro in proveniencia["registros"].values():
        assert registro["arquivo"].startswith("data/raw/")


def test_salario_da_pcdf_publicado_bate_com_a_lei_15395_2026(tmp_path: Path) -> None:
    executar_build(tmp_path)
    carreira = json.loads((tmp_path / "carreira-pcdf.json").read_text(encoding="utf-8"))

    assert carreira["delegado"]["classes"][-1]["salarioCentavos"] == 3887266
    for chave in ("agente", "escrivao", "papiloscopista", "custodia"):
        assert carreira[chave]["classes"][-1]["salarioCentavos"] == 2344038


def test_montar_soldo_militar_atual_bate_com_o_anexo_i() -> None:
    prov = Proveniencia()
    resultado = montar_soldo_militar_atual(prov)
    assert resultado["2º SARGENTO"] == 180480  # R$ 1.804,80, Anexo I, vigência 202601
    assert resultado["CORONEL"] == 480000  # R$ 4.800,00, mesmo anexo
