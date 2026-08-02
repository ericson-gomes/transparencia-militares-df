"""Estrutura de carreira da PCDF: classes, interstício e remuneração por cargo.

Lei 9.264/1996 + Decreto 7.652/2011 + Lei 14.724/2023 (classes e interstício) e
o anexo da PCDF na Lei 15.395/2026 (remuneração vigente — mesma lei já usada
para reajustar PMDF e CBMDF, só que outro anexo).
"""

import json
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path


@dataclass(frozen=True)
class ClassePcdf:
    nome: str
    intersticio_anos: int
    salario: Decimal


@dataclass(frozen=True)
class CargoPcdf:
    nome: str
    classes: list[ClassePcdf]


def carregar(caminho: Path) -> dict[str, CargoPcdf]:
    bruto = json.loads(caminho.read_text(encoding="utf-8"))
    return {
        chave: CargoPcdf(
            nome=cargo["nome"],
            classes=[
                ClassePcdf(
                    nome=classe["nome"],
                    intersticio_anos=classe["intersticio_anos"],
                    salario=Decimal(classe["salario"]),
                )
                for classe in cargo["classes"]
            ],
        )
        for chave, cargo in bruto["cargos"].items()
    }
