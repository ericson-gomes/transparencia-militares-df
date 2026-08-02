"""Tabelas legais de soldo e de VPE dos militares do DF.

A fonte citável é a **Lei 15.395, de 27 de abril de 2026**, que converteu a MP
1.326/2025. Enquanto a MP vigorava ela era a norma; convertida, quem cita a MP
cita um ato que já não é a fonte autônoma do direito. O arquivo da MP continua
versionado como registro histórico, mas o número publicado sai da lei.

A lei dá nova redação ao Anexo I da Lei 10.486/2002 (soldo) e ao Anexo I da Lei
11.134/2005 (VPE). Prova duas coisas de uma vez:

1. As tabelas são **únicas para as duas corporações do DF** — o próprio texto
   nomeia as praças especiais como "Cadete da Academia de Polícia Militar ou
   Bombeiro Militar", sem desdobrar por corporação.
2. A coluna "até 30 de novembro de 2025" é o valor congelado; o reajuste veio em
   dois degraus, dezembro de 2025 e janeiro de 2026.

**Identificação por anexo, nunca por título.** A mesma lei traz outra tabela de
soldo — a do Anexo V, dos ex-Territórios Federais, com valores diferentes. O
rótulo "TABELA I - SOLDO" aparece nas duas e, no HTML da lei, o do Anexo I vem
quebrado no meio de tags: âncora por título casa o anexo errado em silêncio e
publica o soldo de outra carreira. Por isso a busca é pela referência do anexo,
que é inequívoca.
"""

import re
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

from etl.tabela_html import coletar_com_contexto

#: Grafia do documento -> grafia usada no resto do projeto.
NORMALIZACAO = {
    "CORONEL": "CORONEL",
    "TENENTE-CORONEL": "TENENTE-CORONEL",
    "MAJOR": "MAJOR",
    "CAPITÃO": "CAPITÃO",
    "PRIMEIRO-TENENTE": "1º TENENTE",
    "SEGUNDO-TENENTE": "2º TENENTE",
    "ASPIRANTE A OFICIAL": "ASPIRANTE A OFICIAL",
    "CADETE (ÚLTIMO ANO) DA ACADEMIA DE POLÍCIA MILITAR OU BOMBEIRO MILITAR": ("CADETE ÚLTIMO ANO"),
    "CADETE (DEMAIS ANOS) DA ACADEMIA DE POLÍCIA MILITAR OU BOMBEIRO MILITAR": ("CADETE 1º ANO"),
    "SUBTENENTE": "SUBTENENTE",
    "PRIMEIRO-SARGENTO": "1º SARGENTO",
    "SEGUNDO-SARGENTO": "2º SARGENTO",
    "TERCEIRO-SARGENTO": "3º SARGENTO",
    "CABO": "CABO",
    "SOLDADO - PRIMEIRA CLASSE": "SOLDADO 1ª CLASSE",
    "SOLDADO - SEGUNDA CLASSE": "SOLDADO 2ª CLASSE",
}

# Referência de anexo alterado, como os dois documentos a escrevem: "Anexo I à
# Lei nº 10.486" na MP, "Anexo I da Lei nº 10.486" na lei que a converteu. A
# preposição varia; a designação do anexo e o número da lei, não.
#
# Captura a designação junto porque ela é o que separa o Anexo I da Lei 10.486
# (soldo dos militares do DF) do Anexo I-A da mesma lei (ex-Territórios) — duas
# tabelas de soldo, valores diferentes, mesma lei citada.
_REFERENCIA_ANEXO = re.compile(
    r"Anexo\s+([IVXLC]+(?:-[A-Z])?)\s+(?:à|da|do)\s+Lei\s+n[ºo°]?\s*([\d.]+?)[,\s]",
    re.IGNORECASE,
)

#: (designação do anexo, número da lei alterada) de cada tabela que interessa.
ANEXO_SOLDO = ("I", "10.486")
ANEXO_VPE = ("I", "11.134")

#: Vigência de cada coluna de valor, na ordem do documento.
VIGENCIAS = ("202511", "202512", "202601")

#: Último mês do soldo congelado. O reajuste tem dois degraus: 202512 e 202601.
VIGENCIA_CONGELADA = "202511"
VIGENCIA_ATUAL = "202601"


@dataclass(frozen=True)
class LinhaTabelaLegal:
    posto: str
    #: Valor por vigência, nas chaves de `VIGENCIAS`.
    por_vigencia: dict[str, Decimal]


def _decimal(bruto: str) -> Decimal:
    return Decimal(bruto.strip().replace(".", "").replace(",", "."))


def _e_linha_de_valor(celulas: list[str]) -> bool:
    return len(celulas) == 4 and celulas[0].upper() in NORMALIZACAO


def _tabela_do_anexo(html: str, anexo: tuple[str, str]) -> list[list[str]]:
    """Tabela de valores cuja referência de anexo mais próxima é a pedida.

    Usa a **última** referência que aparece antes da tabela, não qualquer uma:
    os artigos do corpo da lei citam todos os anexos alterados, então "existe
    uma menção antes" é verdade para todas as tabelas do documento e não
    discrimina nada.
    """
    for coletada in coletar_com_contexto(html):
        if not any(_e_linha_de_valor(linha) for linha in coletada.linhas):
            continue
        referencias = _REFERENCIA_ANEXO.findall(coletada.contexto)
        if not referencias:
            continue
        designacao, lei = referencias[-1]
        if (designacao.upper(), lei.rstrip(".")) == anexo:
            return coletada.linhas
    raise ValueError(f"nenhuma tabela de valores sob o anexo {anexo}")


def _parse_tabela(tabela: list[list[str]]) -> dict[str, LinhaTabelaLegal]:
    linhas: dict[str, LinhaTabelaLegal] = {}
    for celulas in tabela:
        if not _e_linha_de_valor(celulas):
            continue
        posto = NORMALIZACAO[celulas[0].upper()]
        linhas[posto] = LinhaTabelaLegal(
            posto=posto,
            por_vigencia={
                vigencia: _decimal(bruto)
                for vigencia, bruto in zip(VIGENCIAS, celulas[1:], strict=True)
            },
        )
    if len(linhas) != len(NORMALIZACAO):
        raise ValueError(
            f"layout não reconhecido: {len(linhas)} postos lidos, {len(NORMALIZACAO)} esperados"
        )
    return linhas


def _ler(caminho: Path) -> str:
    return caminho.read_text(encoding="latin-1")


def soldo(caminho: Path) -> dict[str, LinhaTabelaLegal]:
    return _parse_tabela(_tabela_do_anexo(_ler(caminho), ANEXO_SOLDO))


def vpe(caminho: Path) -> dict[str, LinhaTabelaLegal]:
    return _parse_tabela(_tabela_do_anexo(_ler(caminho), ANEXO_VPE))
