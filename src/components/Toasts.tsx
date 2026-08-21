import { IconeAlerta, IconeCheck, IconeX } from "./Icons";

export type Toast = { id: number; tipo: "ok" | "erro"; msg: string };

export default function ToastStack({
  toasts,
  aoFechar,
}: {
  toasts: Toast[];
  aoFechar: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`animate-subir flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm shadow-lg ${
            t.tipo === "ok"
              ? "border-pine-200 bg-pine-50 text-pine-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.tipo === "ok" ? <IconeCheck className="size-4" /> : <IconeAlerta className="size-4" />}
          </span>
          <p className="flex-1 leading-snug">{t.msg}</p>
          <button
            type="button"
            onClick={() => aoFechar(t.id)}
            className="shrink-0 opacity-50 transition-opacity hover:opacity-100"
            aria-label="Fechar aviso"
          >
            <IconeX className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
