"""Parser das tabelas de remuneração do CBMDF. Dois layouts, ver docstring de `parse`."""

import re
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

from pypdf import PdfReader

MESES = {
    "JANEIRO": "01",
    "FEVEREIRO": "02",
    "MARÇO": "03",
    "ABRIL": "04",
    "MAIO": "05",
    "JUNHO": "06",
    "JULHO": "07",
    "AGOSTO": "08",
    "SETEMBRO": "09",
    "OUTUBRO": "10",
    "NOVEMBRO": "11",
    "DEZEMBRO": "12",
}

# Nomes de posto divergem entre layouts; normaliza para a forma usada em 2026.
NORMALIZACAO = {
    "TEN. CORONEL": "TENENTE-CORONEL",
    "ASP. OFICIAL": "ASPIRANTE A OFICIAL",
    "ALUNO 1º ANO": "CADETE 1º ANO",
    "ALUNO 2º ANO": "CADETE ÚLTIMO ANO",
    "SOLD. 2ª CLASSE": "SOLDADO 2ª CLASSE",
    "SOLDADO": "SOLDADO 1ª CLASSE",
}

# Ordem importa para a alternância do regex: nomes que são prefixo de outros
# (ex.: "SOLDADO" é prefixo de "SOLDADO 1ª CLASSE") precisam vir depois,
# senão o regex casa a forma curta e para antes de tentar a longa.
POSTOS = (
    "CORONEL",
    "TENENTE-CORONEL",
    "TEN. CORONEL",
    "MAJOR",
    "CAPITÃO",
    "1º TENENTE",
    "2º TENENTE",
    "ASPIRANTE A OFICIAL",
    "ASP. OFICIAL",
    "CADETE ÚLTIMO ANO",
    "CADETE 1º ANO",
    "ALUNO 2º ANO",
    "ALUNO 1º ANO",
    "SUBTENENTE",
    "1º SARGENTO",
    "2º SARGENTO",
    "3º SARGENTO",
    "CABO",
    "SOLDADO 1ª CLASSE",
    "SOLD. 2ª CLASSE",
    "SOLDADO 2ª CLASSE",
    "SOLDADO",
)

VALOR = r"R?\$?\s*(?:-|[\d.]+,\d{2})"
PERCENTUAL = r"\d{2}%"

_CAMPO_RE = re.compile(f"{VALOR}|{PERCENTUAL}")
_PERCENTUAL_RE = re.compile(f"^{PERCENTUAL}$")
_POSTO_ALTERNATIVAS = "|".join(re.escape(posto) for posto in POSTOS)
_BLOCO_RE = re.compile(f"({_POSTO_ALTERNATIVAS})((?:\\s*(?:{VALOR}|{PERCENTUAL}))+)")
_VIGENCIA_RE = re.compile(r"VIG[ÊE]NCIA(?:\s+EM)?:?\s+([A-ZÇ]+)\s+(?:DE\s+)?(\d{4})")


@dataclass(frozen=True)
class LinhaRemuneracao:
    posto: str
    soldo: Decimal
    vpe: Decimal
    total: Decimal
    aux_alimentacao: Decimal


def extrair_texto(pdf: Path) -> str:
    return "".join(pagina.extract_text() for pagina in PdfReader(pdf).pages)


def _decimal(bruto: str) -> Decimal:
    limpo = bruto.replace("R$", "").replace(" ", "").strip()
    if limpo in {"-", ""}:
        return Decimal(0)
    return Decimal(limpo.replace(".", "").replace(",", "."))


def _vigencia(texto: str) -> str:
    achado = _VIGENCIA_RE.search(texto)
    if achado is None:
        raise ValueError("layout não reconhecido: vigência ausente")
    mes = MESES.get(achado.group(1))
    if mes is None:
        raise ValueError(f"layout não reconhecido: mês '{achado.group(1)}' desconhecido")
    return achado.group(2) + mes


def _e_layout_2026(texto: str) -> bool:
    """Layout 2026 prefixa valores com `R$`; layout 2020 não usa esse prefixo."""
    return "R$" in texto


def parse(texto: str) -> tuple[str, list[LinhaRemuneracao]]:
    """Devolve (vigência AAAAMM, linhas).

    Layout 2020: uma linha por posto, sem `R$`, com percentual do APG logo
    após o soldo.
    Ordem dos campos numéricos: SOLDO, APG, AOM, GFR, GCEF, VPE, GRV, ACP,
    TOTAL, AMCD, AMSD, AUX.ALIM.

    Layout 2026: texto corrido, valores prefixados por `R$`, com coluna
    extra `Compl. Soldo` e sem percentual.
    Ordem dos campos numéricos: SOLDO, COMPL.SOLDO, APG, AOM, GFR, GCEF,
    VPE, GRV, ACP, TOTAL, AUX.ALIM, AMSD, AMCD.

    Em ambos os casos o percentual do APG (quando presente) é descartado
    antes de indexar os campos, então os índices abaixo já são relativos à
    lista sem o percentual.
    """
    vigencia = _vigencia(texto)
    de_2026 = _e_layout_2026(texto)
    minimo_campos = 13 if de_2026 else 12

    linhas: list[LinhaRemuneracao] = []
    vistos: set[str] = set()
    for bloco in _BLOCO_RE.finditer(texto):
        posto = NORMALIZACAO.get(bloco.group(1), bloco.group(1))
        if posto in vistos:
            continue
        campos = [
            campo
            for campo in _CAMPO_RE.findall(bloco.group(2))
            if not _PERCENTUAL_RE.match(campo.strip())
        ]
        if len(campos) < minimo_campos:
            continue
        vistos.add(posto)
        if de_2026:
            vpe, total, aux_alimentacao = campos[6], campos[9], campos[10]
        else:
            vpe, total, aux_alimentacao = campos[5], campos[8], campos[11]
        linhas.append(
            LinhaRemuneracao(
                posto=posto,
                soldo=_decimal(campos[0]),
                vpe=_decimal(vpe),
                total=_decimal(total),
                aux_alimentacao=_decimal(aux_alimentacao),
            )
        )
    if not linhas:
        raise ValueError("layout não reconhecido: nenhuma linha de posto encontrada")
    return vigencia, linhas
