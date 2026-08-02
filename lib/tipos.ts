export type ChaveCorporacao = "pmdf" | "cbmdf";

export type ChaveCargoPcdf = "delegado" | "agente" | "escrivao" | "papiloscopista" | "custodia";

export type ClassePcdf = {
  nome: string;
  intersticioAnos: number;
  salarioCentavos: number;
};

export type CargoPcdf = {
  nome: string;
  classes: ClassePcdf[];
};

export type CarreiraPcdf = Record<ChaveCargoPcdf, CargoPcdf>;

/**
 * Agrupamento exibido no formulário: Delegado tem tabela própria (Anexo III
 * da Lei 15.395/2026), os outros quatro cargos comuns (Agente, Escrivão,
 * Papiloscopista, Agente de Custódia) têm todos o mesmo subsídio (Anexo IV,
 * Quadro II) — ver `lib/gruposCargoPcdf.ts`. Definido aqui, não em
 * `gruposCargoPcdf.ts`, porque `LadoComparador` (abaixo) precisa dele e
 * `tipos.ts` é a única fonte de tipo compartilhado do projeto — evita import
 * circular entre os dois arquivos.
 */
export type GrupoCargoPcdf = "delegado" | "demais";

/**
 * Um lado da comparação. Militar: patente informada direto (não simulada) —
 * lookup direto na remuneração/soldo de hoje. PCDF: grupo de cargo + ano de
 * ingresso compartilhado do formulário — classe de hoje calculada por
 * interstício.
 */
export type LadoComparador =
  | { tipo: "militar"; corporacao: ChaveCorporacao; posto: string }
  | { tipo: "pcdf"; grupo: GrupoCargoPcdf };

/** Um lado já resolvido pro ano de referência — o que `ResultadoComparador` consome. */
export type LadoResolvido = {
  nome: string;
  salarioHojeCentavos: number;
  rotuloHoje: string;
};

/**
 * Janela de vigência de um interstício. Reaproveitado para a PCDF mesmo sem
 * histórico de mudança documentado (`vigenciaFim: null` cobrindo desde 1996) —
 * ver `lib/comparador/calculo.ts`.
 */
export type DegrauIntersticio = {
  origem: string;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  intersticioAnos: number;
};

/**
 * `projetado: true` marca uma classe que ainda não foi alcançada no ano
 * corrente — não deve acontecer no comparador atual, já que o ano de ingresso
 * é limitado ao ano de corte dos dados, mas o simulador continua expondo o
 * campo para não esconder a premissa.
 */
export type PassoTrajetoria = {
  degrau: string;
  ano: number;
  salarioCentavos: number;
  projetado: boolean;
};

export type RegistroProveniencia = {
  arquivo: string;
  observacao: string;
};

export type Proveniencia = {
  registros: Record<string, RegistroProveniencia>;
};

export type Metadados = {
  geradoEm: string;
};

export type ProjecaoAno = {
  anos: number;
  acumuladoCentavos: number;
};

export type ResultadoComparador = {
  ladoA: LadoResolvido;
  ladoB: LadoResolvido;
  diferencaMensalCentavos: number;
  projecao: ProjecaoAno[];
};
