"""Extração das `<table>` de um documento HTML arquivado, como texto de célula.

Usado por `seec` (páginas da Secretaria de Economia do DF) e por `tabelas_legais`
(anexos legislativos exportados do Word). Os dois documentos são arquivos
versionados em `data/raw/`, não HTML arbitrário de rede.

Cada tabela vem acompanhada do texto que a antecede. Isso existe porque nos
documentos legislativos o título da tabela ("TABELA I - SOLDO") se repete entre
anexos e frequentemente quebra no meio de tags — identificar a tabela certa por
título casa o anexo errado em silêncio. O texto de contexto carrega a referência
do anexo ("Anexo I da Lei nº 10.486..."), que é inequívoca.
"""

import re
from dataclasses import dataclass, field
from html.parser import HTMLParser

Tabela = list[list[str]]


@dataclass
class TabelaComContexto:
    #: Texto corrido que antecede a tabela, desde o fim da tabela anterior.
    contexto: str
    linhas: Tabela = field(default_factory=list)


class _Coletor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.coletadas: list[TabelaComContexto] = []
        self._pilha: list[TabelaComContexto] = []
        self._contexto_pendente: list[str] = []
        self._linha: list[str] | None = None
        self._celula: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "table":
            # Tabela aninhada: empilha em vez de perder a de fora. O contexto
            # viaja junto na pilha para não desalinhar quando a interna fechar
            # primeiro.
            self._pilha.append(TabelaComContexto(contexto=self._texto_pendente()))
        elif tag == "tr" and self._pilha:
            self._linha = []
        elif tag in {"td", "th"} and self._linha is not None:
            self._celula = []

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self._celula is not None and self._linha is not None:
            self._linha.append(re.sub(r"\s+", " ", "".join(self._celula)).strip())
            self._celula = None
        elif tag == "tr" and self._linha is not None and self._pilha:
            if any(self._linha):
                self._pilha[-1].linhas.append(self._linha)
            self._linha = None
        elif tag == "table" and self._pilha:
            self.coletadas.append(self._pilha.pop())

    def handle_data(self, data: str) -> None:
        if self._celula is not None:
            self._celula.append(data)
        elif not self._pilha:
            self._contexto_pendente.append(data)

    def _texto_pendente(self) -> str:
        texto = re.sub(r"\s+", " ", "".join(self._contexto_pendente)).strip()
        self._contexto_pendente = []
        return texto


def coletar_com_contexto(html: str) -> list[TabelaComContexto]:
    coletor = _Coletor()
    coletor.feed(html)
    return coletor.coletadas


def coletar_tabelas(html: str) -> list[Tabela]:
    return [coletada.linhas for coletada in coletar_com_contexto(html)]
