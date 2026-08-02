"""Parser das tabelas de escalonamento vertical publicadas pela Secretaria de
Estado de Economia do DF — uma por corporação, mesmo órgão e mesmo formato.

Existe para uma única pergunta: a remuneração da PMDF e a do CBMDF são a mesma?
As duas páginas (`data/raw/pmdf/tabela-remuneracao-*-seec-202001.html`) são o
par comparável que responde isso sem depender de interpretação — ver
`tests/test_seec.py`.

A tabela tem 13 colunas de valor por posto, mas o cabeçalho lista 12 rótulos:
a coluna do APG traz duas células, o percentual e o valor em reais. Por isso os
campos são lidos por posição, na ordem documentada em `LinhaSeec`.
"""

import re
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

from etl.tabela_html import coletar_tabelas

# A página usa as abreviações da SEEC; o resto do projeto usa a grafia das
# tabelas do CBMDF (ver `remuneracao.NORMALIZACAO`). Traduz para essa grafia
# para que os dois lados sejam comparáveis por nome de posto.
#
# "Aluno 3º Ano" e "Aluno 1º/2º Ano" nomeiam os mesmos degraus que o PDF do
# CBMDF chama de "ALUNO 2º ANO" e "ALUNO 1º ANO": a academia tem três anos e a
# tabela da SEEC agrupa os dois primeiros, que têm soldo igual. O soldo bate
# (706,10 e 501,62 em ambas as fontes) — é diferença de rótulo, não de valor.
NORMALIZACAO = {
    "CORONEL": "CORONEL",
    "TEN. CORONEL": "TENENTE-CORONEL",
    "MAJOR": "MAJOR",
    "CAPITÃO": "CAPITÃO",
    "1º TENENTE": "1º TENENTE",
    "2º TENENTE": "2º TENENTE",
    "ASP. OFICIAL": "ASPIRANTE A OFICIAL",
    "ALUNO 3º ANO": "CADETE ÚLTIMO ANO",
    "ALUNO 1º/2º ANO": "CADETE 1º ANO",
    "SUBTENENTE": "SUBTENENTE",
    "1º SARGENTO": "1º SARGENTO",
    "2º SARGENTO": "2º SARGENTO",
    "3º SARGENTO": "3º SARGENTO",
    "CABO": "CABO",
    "SOLDADO": "SOLDADO 1ª CLASSE",
    "SOLD. 2ª CLASSE": "SOLDADO 2ª CLASSE",
}

# Sentinela de "não se aplica" da página (travessão), usada no ACP dos alunos.
_SEM_VALOR = {"–", "-", "—", ""}

_NUMERO_RE = re.compile(r"^\d{1,3}(?:\.\d{3})*,\d{2}$")
_PERCENTUAL_RE = re.compile(r"^\d{1,3}%$")
_VIGENCIA_RE = re.compile(r"Vig[êe]ncia:\s*([A-Za-zç]+)\s*/\s*(\d{4})", re.IGNORECASE)

MESES = {
    "janeiro": "01",
    "fevereiro": "02",
    "março": "03",
    "abril": "04",
    "maio": "05",
    "junho": "06",
    "julho": "07",
    "agosto": "08",
    "setembro": "09",
    "outubro": "10",
    "novembro": "11",
    "dezembro": "12",
}


@dataclass(frozen=True)
class LinhaSeec:
    """Uma linha da tabela, na ordem em que as colunas aparecem na página.

    `total` é a soma das oito parcelas remuneratórias (soldo, apg, aom, gfr,
    gcef, vpe, grv, acp) — auxílio-alimentação e auxílio-moradia ficam de fora,
    exatamente como na comparação com a PF. `parcelas()` recalcula essa soma e
    `test_total_e_a_soma_das_parcelas_sem_alimentacao_nem_moradia` confere.
    """

    posto: str
    soldo: Decimal
    apg_percentual: int
    apg: Decimal
    aom: Decimal
    gfr: Decimal
    gcef: Decimal
    vpe: Decimal
    grv: Decimal
    acp: Decimal
    total: Decimal
    amcd: Decimal
    amsd: Decimal
    aux_alimentacao: Decimal

    def parcelas(self) -> Decimal:
        return (
            self.soldo + self.apg + self.aom + self.gfr + self.gcef + self.vpe + self.grv + self.acp
        )


def _decimal(bruto: str) -> Decimal:
    limpo = bruto.replace("R$", "").replace("\xa0", " ").strip()
    if limpo in _SEM_VALOR:
        return Decimal(0)
    if not _NUMERO_RE.match(limpo):
        raise ValueError(f"valor não reconhecido na tabela da SEEC: {bruto!r}")
    return Decimal(limpo.replace(".", "").replace(",", "."))


def _percentual(bruto: str) -> int:
    limpo = bruto.strip()
    if not _PERCENTUAL_RE.match(limpo):
        raise ValueError(f"percentual não reconhecido na tabela da SEEC: {bruto!r}")
    return int(limpo.rstrip("%"))


def vigencia(html: str) -> str:
    """Devolve a vigência declarada na página, em AAAAMM."""
    achado = _VIGENCIA_RE.search(html)
    if achado is None:
        raise ValueError("layout não reconhecido: vigência ausente")
    mes = MESES.get(achado.group(1).lower())
    if mes is None:
        raise ValueError(f"layout não reconhecido: mês '{achado.group(1)}' desconhecido")
    return achado.group(2) + mes


def parse(html: str) -> tuple[str, list[LinhaSeec]]:
    """Devolve (vigência AAAAMM, linhas) da tabela de escalonamento vertical."""
    linhas: list[LinhaSeec] = []
    for tabela in coletar_tabelas(html):
        for celulas in tabela:
            if len(celulas) != 14:
                continue
            posto = NORMALIZACAO.get(celulas[0].upper())
            if posto is None:
                continue
            linhas.append(
                LinhaSeec(
                    posto=posto,
                    soldo=_decimal(celulas[1]),
                    apg_percentual=_percentual(celulas[2]),
                    apg=_decimal(celulas[3]),
                    aom=_decimal(celulas[4]),
                    gfr=_decimal(celulas[5]),
                    gcef=_decimal(celulas[6]),
                    vpe=_decimal(celulas[7]),
                    grv=_decimal(celulas[8]),
                    acp=_decimal(celulas[9]),
                    total=_decimal(celulas[10]),
                    amcd=_decimal(celulas[11]),
                    amsd=_decimal(celulas[12]),
                    aux_alimentacao=_decimal(celulas[13]),
                )
            )

    if not linhas:
        raise ValueError("layout não reconhecido: nenhuma linha de posto encontrada")
    return vigencia(html), linhas


def carregar(caminho: Path) -> tuple[str, dict[str, LinhaSeec]]:
    vigente, linhas = parse(caminho.read_text(encoding="utf-8", errors="replace"))
    return vigente, {linha.posto: linha for linha in linhas}
