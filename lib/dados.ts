import provenienciaJson from "../public/data/proveniencia.json";
import carreiraPcdfJson from "../public/data/carreira-pcdf.json";
import remuneracaoMilitarAtualJson from "../public/data/remuneracao-militar-atual.json";
import soldoMilitarAtualJson from "../public/data/soldo-militar-atual.json";
import metadadosJson from "../public/data/metadados.json";
import type { CarreiraPcdf, Metadados, Proveniencia } from "./tipos";

export function carregarProveniencia(): Proveniencia {
  return provenienciaJson as unknown as Proveniencia;
}

export function carregarCarreiraPcdf(): CarreiraPcdf {
  return carreiraPcdfJson as unknown as CarreiraPcdf;
}

export function carregarRemuneracaoMilitarAtual(): Record<string, number> {
  return remuneracaoMilitarAtualJson as unknown as Record<string, number>;
}

export function carregarSoldoMilitarAtual(): Record<string, number> {
  return soldoMilitarAtualJson as unknown as Record<string, number>;
}

export function carregarMetadados(): Metadados {
  return metadadosJson as unknown as Metadados;
}
