"""Registro de qual arquivo original sustenta cada número exibido."""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Proveniencia:
    _registros: dict[str, dict[str, str]] = field(default_factory=dict)

    def registrar(self, chave: str, arquivo: str, observacao: str) -> None:
        self._registros[chave] = {"arquivo": arquivo, "observacao": observacao}

    def como_dicionario(self) -> dict[str, dict[str, str]]:
        return dict(self._registros)

    def exigir_completo(self, chaves: set[str]) -> None:
        faltando = chaves - set(self._registros)
        if faltando:
            raise ValueError(f"sem proveniência: {sorted(faltando)}")

    def serializar(self) -> dict[str, Any]:
        return {"registros": self.como_dicionario()}
