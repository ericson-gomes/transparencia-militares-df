"""Build dos JSON públicos consumidos pelo site, com registro de proveniência.

Publica a carreira da PCDF, a remuneração militar atual e um carimbo de data
(`metadados.json`), com sanidade de que a remuneração de PMDF e CBMDF continua
idêntica (`conferir_identidade_remuneratoria`). Nada é publicado sem
proveniência completa (`Proveniencia.exigir_completo`).
"""

import json
from datetime import UTC, datetime
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path
from typing import Any, TypedDict

from etl.carreira_pcdf import carregar as carregar_carreira_pcdf
from etl.proveniencia import Proveniencia
from etl.remuneracao import LinhaRemuneracao, extrair_texto
from etl.remuneracao import parse as parse_remuneracao
from etl.seec import carregar as carregar_seec
from etl.tabelas_legais import VIGENCIA_ATUAL, soldo

RAIZ = Path(__file__).resolve().parents[3]
DADOS_RAW = RAIZ / "data/raw"
PUBLICO = RAIZ / "public/data"

# Tabelas da Secretaria de Economia do DF, uma por corporação. Conferi-las a
# cada build é o que impede o comparador de continuar reaproveitando a mesma
# remuneração para as duas corporações depois de uma eventual mudança na lei
# que as desdobre — ver `conferir_identidade_remuneratoria`.
TABELA_SEEC_PMDF = DADOS_RAW / "pmdf/tabela-remuneracao-pmdf-seec-202001.html"
TABELA_SEEC_CBMDF = DADOS_RAW / "pmdf/tabela-remuneracao-cbmdf-seec-202001.html"


class ClassePcdfSaida(TypedDict):
    nome: str
    intersticioAnos: int
    salarioCentavos: int


class CargoPcdfSaida(TypedDict):
    nome: str
    classes: list[ClassePcdfSaida]


class Metadados(TypedDict):
    geradoEm: str


def _centavos(valor: Decimal) -> int:
    return int((valor * 100).quantize(Decimal(1), rounding=ROUND_HALF_UP))


def conferir_identidade_remuneratoria() -> None:
    """As tabelas da PMDF e do CBMDF têm que continuar idênticas.

    O comparador usa uma única tabela de remuneração militar para as duas
    corporações porque a remuneração é a mesma (mesmo Anexo I da Lei
    10.486/2002 e da Lei 11.134/2005). Se a lei desdobrar as tabelas por
    corporação, o lado militar da comparação passa a mostrar número errado
    para uma delas — e o build tem que parar antes de publicar, não depois.
    """
    _, pmdf = carregar_seec(TABELA_SEEC_PMDF)
    _, cbmdf = carregar_seec(TABELA_SEEC_CBMDF)
    divergentes = sorted(
        posto for posto in set(pmdf) | set(cbmdf) if pmdf.get(posto) != cbmdf.get(posto)
    )
    if divergentes:
        raise ValueError(
            "tabela de remuneração da PMDF divergiu da do CBMDF em "
            f"{divergentes} — o comparador deixou de valer para as duas "
            "corporações, build abortado"
        )


def montar_carreira_pcdf(prov: Proveniencia) -> dict[str, CargoPcdfSaida]:
    cargos = carregar_carreira_pcdf(DADOS_RAW / "carreira-pcdf.json")
    prov.registrar(
        "pcdf.carreira",
        "data/raw/carreira-pcdf.json",
        "Lei 9.264/1996 + Decreto 7.652/2011 + Lei 14.724/2023 (classes e "
        "interstício) e Anexos III/IV da PCDF na Lei 15.395/2026 (remuneração "
        "vigente)",
    )
    return {
        chave: {
            "nome": cargo.nome,
            "classes": [
                {
                    "nome": classe.nome,
                    "intersticioAnos": classe.intersticio_anos,
                    "salarioCentavos": _centavos(classe.salario),
                }
                for classe in cargo.classes
            ],
        }
        for chave, cargo in cargos.items()
    }


def montar_remuneracao_militar_atual(
    por_posto_2026: dict[str, LinhaRemuneracao], prov: Proveniencia
) -> dict[str, int]:
    prov.registrar(
        "militar.remuneracaoAtual",
        "data/raw/remuneracao-2026-01.pdf",
        "coluna TOTAL, vigência 202601, por posto — lado militar do comparador",
    )
    return {posto: _centavos(linha.total) for posto, linha in por_posto_2026.items()}


def montar_soldo_militar_atual(prov: Proveniencia) -> dict[str, int]:
    tabela = soldo(DADOS_RAW / "pmdf/lei-15395-2026.htm")
    prov.registrar(
        "militar.soldoAtual",
        "data/raw/pmdf/lei-15395-2026.htm",
        f"Anexo I da Lei 15.395/2026, coluna SOLDO, vigência {VIGENCIA_ATUAL} — "
        "base de cálculo da contribuição previdenciária do militar (Lei "
        "10.486/2002, art. 33 §1º e art. 36 §2º: incide sobre o soldo, não "
        "a remuneração total)",
    )
    return {posto: _centavos(linha.por_vigencia[VIGENCIA_ATUAL]) for posto, linha in tabela.items()}


def _gravar(caminho: Path, dados: Any) -> None:
    caminho.write_text(
        json.dumps(dados, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def main(saida: Path = PUBLICO) -> None:
    """Roda o build completo e grava os JSON em `saida` (default: `public/data/`).

    `saida` é parametrizável para permitir que testes de integração gravem em um
    diretório descartável (`tmp_path`) em vez de sujar `public/data/` a cada
    rodada da suíte.
    """
    prov = Proveniencia()
    conferir_identidade_remuneratoria()

    _, linhas_2026 = parse_remuneracao(extrair_texto(DADOS_RAW / "remuneracao-2026-01.pdf"))
    por_posto_2026 = {linha.posto: linha for linha in linhas_2026}

    prov.registrar(
        "remuneracao.identidade",
        "data/raw/pmdf/tabela-remuneracao-pmdf-seec-202001.html",
        "tabela de escalonamento vertical da PMDF publicada pela Secretaria de "
        "Economia do DF, idêntica célula a célula à do CBMDF (mesma vigência "
        "202001) — é o que autoriza o comparador a valer para as duas "
        "corporações",
    )

    carreira_pcdf = montar_carreira_pcdf(prov)
    remuneracao_militar_atual = montar_remuneracao_militar_atual(por_posto_2026, prov)
    soldo_militar_atual = montar_soldo_militar_atual(prov)
    metadados: Metadados = {"geradoEm": datetime.now(UTC).isoformat()}

    prov.exigir_completo(
        {
            "remuneracao.identidade",
            "pcdf.carreira",
            "militar.remuneracaoAtual",
            "militar.soldoAtual",
        }
    )

    saida.mkdir(parents=True, exist_ok=True)
    _gravar(saida / "proveniencia.json", prov.serializar())
    _gravar(saida / "carreira-pcdf.json", carreira_pcdf)
    _gravar(saida / "remuneracao-militar-atual.json", remuneracao_militar_atual)
    _gravar(saida / "soldo-militar-atual.json", soldo_militar_atual)
    _gravar(saida / "metadados.json", metadados)


if __name__ == "__main__":
    main()
