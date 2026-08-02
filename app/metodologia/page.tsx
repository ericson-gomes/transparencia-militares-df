import type { Metadata } from "next";
import { Metodologia } from "@/componentes/Metodologia";

export const metadata: Metadata = {
  title: "Metodologia — comparador PM/CBM x PCDF",
  description:
    "Proveniência de cada número do comparador PM/CBM x PCDF e as premissas declaradas do método.",
};

export default function Pagina() {
  return <Metodologia />;
}
