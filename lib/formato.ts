const FORMATADOR = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarCentavos(valor: number): string {
  return FORMATADOR.format(valor / 100).replace(" ", " ");
}
