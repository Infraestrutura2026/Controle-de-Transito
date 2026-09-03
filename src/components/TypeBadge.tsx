import { ehTipo, type Tipo } from "@/lib/constantes";

const ESTILO: Record<Tipo, string> = {
  SA: "bg-sa-100 text-sa-700 ring-sa-700/25",
  FE: "bg-stone-200/70 text-stone-700 ring-stone-500/25",
  CR: "bg-cr-100 text-cr-700 ring-cr-700/25",
  OUTRO: "bg-amber-100 text-amber-700 ring-amber-600/25",
};

export default function TypeBadge({ tipo }: { tipo: string }) {
  const t: Tipo = ehTipo(tipo) ? tipo : "FE";
  return (
    <span
      className={`inline-flex min-w-9 items-center justify-center rounded px-2 py-0.5 font-display text-xs font-bold tracking-wider ring-1 ring-inset ${ESTILO[t]}`}
      title={`Regime ${t} (conforme planilha)`}
    >
      {t}
    </span>
  );
}
