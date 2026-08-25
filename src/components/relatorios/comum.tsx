"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Saida } from "@/db/schema";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import {
  dataBRParaISO,
  diasAtrasBR,
  hojeBR,
  primeiroDiaMesBR,
} from "@/lib/format";
import Brasao from "../Brasao";
import CampoDataBR from "../CampoDataBR";
import { IconeDownload, IconeImpressora } from "../Icons";

/* ---------------- utilidades ---------------- */

export function baixarCSV(nomeArquivo: string, cabecalho: string[], linhas: string[][]) {
  const esc = (c: string | number) => `"${String(c ?? "").replace(/"/g, '""')}"`;
  const corpo = [cabecalho.map(esc).join(";"), ...linhas.map((l) => l.map(esc).join(";"))].join(
    "\r\n"
  );
  const blob = new Blob(["\uFEFF" + corpo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function primeiroDiaDoMesBR(): string {
  return primeiroDiaMesBR();
}

export function pct(n: number, total: number): string {
  if (!total) return "0%";
  return `${((n / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

/** Busca saídas com atualização automática a cada 10s. */
export function useSaidas(params: Record<string, string> = {}) {
  const [itens, setItens] = useState<Saida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const chave = JSON.stringify(params);

  useEffect(() => {
    let ativo = true;
    async function buscar(silencioso = false) {
      if (!silencioso && ativo) setCarregando(true);
      try {
        const normalizados = { ...params };
        if (normalizados.de) normalizados.de = dataBRParaISO(normalizados.de);
        if (normalizados.ate) normalizados.ate = dataBRParaISO(normalizados.ate);
        const p = new URLSearchParams({
          perPage: "100000",
          sort: "data",
          dir: "asc",
          ...normalizados,
        });
        const r = await fetch(`/api/saidas?${p.toString()}`);
        if (!r.ok) throw new Error();
        const corpo = (await r.json()) as { itens?: Saida[] };
        if (ativo) setItens(corpo.itens ?? []);
      } catch {
        if (ativo) setItens([]);
      } finally {
        if (ativo && !silencioso) setCarregando(false);
      }
    }
    void buscar();
    const id = window.setInterval(() => void buscar(true), 10000);
    return () => {
      ativo = false;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return { itens, carregando };
}

/* ---------------- classes de tabela ---------------- */

export const TBL = "w-full border-collapse text-left text-sm";
export const TH =
  "border-b-2 border-line bg-paper/60 py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-mute";
export const TD = "border-b border-line py-2.5 px-3 align-top";

/* ---------------- blocos visuais ---------------- */

const TONS = {
  padrao: "border-line bg-paper/50 text-ink",
  azul: "border-sa-100 bg-sa-100/30 text-sa-700",
  neutro: "border-stone-200 bg-stone-100/60 text-stone-800",
  vermelho: "border-cr-100 bg-cr-100/30 text-cr-700",
} as const;

export function Cartao({
  rotulo,
  valor,
  tom = "padrao",
}: {
  rotulo: string;
  valor: string | number;
  tom?: keyof typeof TONS;
}) {
  return (
    <div className={`rounded-lg border p-3 ${TONS[tom]}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{rotulo}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{valor}</p>
    </div>
  );
}

export function CabecalhoRelatorio({
  titulo,
  subtitulo,
  usuarioNome,
}: {
  titulo: string;
  subtitulo?: string;
  usuarioNome: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
      <div className="flex items-center gap-3.5">
        <Brasao className="size-16 shrink-0 drop-shadow-sm" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-pine-700">
            {NOME_UNIDADE.toUpperCase()} · {SETOR_RESPONSAVEL.toUpperCase()}
          </span>
          <h2 className="font-display text-2xl font-bold text-ink">{titulo}</h2>
          {subtitulo ? <p className="text-sm font-medium text-ink-mute">{subtitulo}</p> : null}
        </div>
      </div>
      <div className="text-xs text-ink-mute sm:text-right">
        <p className="inline-flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pine-300 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-pine-600" />
          </span>
          Atualiza automaticamente
        </p>
        <p className="mt-1">
          Emissor: <b className="text-ink-soft">{usuarioNome}</b>
        </p>
      </div>
    </div>
  );
}

export function BotoesRelatorio({
  aoExportar,
  exportarDesabilitado = false,
}: {
  aoExportar: () => void;
  exportarDesabilitado?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={aoExportar}
        disabled={exportarDesabilitado}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-white/70 px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-line/50 disabled:opacity-50"
      >
        <IconeDownload className="size-4" />
        Exportar CSV
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        disabled={exportarDesabilitado}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-pine-700 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800 disabled:opacity-50"
      >
        <IconeImpressora className="size-4" />
        Imprimir
      </button>
    </div>
  );
}

const CHIP =
  "h-9 rounded-lg border border-line-strong bg-white/70 px-3 text-xs font-semibold text-ink-soft transition-colors hover:bg-line/50";

export function SeletorPeriodo({
  de,
  ate,
  aoMudar,
}: {
  de: string;
  ate: string;
  aoMudar: (de: string, ate: string) => void;
}) {
  const hoje = hojeBR();
  const inicioMes = primeiroDiaDoMesBR();
  const cls =
    "h-9 w-32 rounded-lg border border-line-strong bg-white/70 px-2.5 text-sm font-display tabular-nums outline-none focus:ring-2 focus:ring-pine-300";
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <span className="text-sm font-semibold text-ink-soft">Período:</span>
      <CampoDataBR
        value={de}
        onChange={(valor) => aoMudar(valor, ate)}
        className={cls}
        ariaLabel="Data inicial no formato DD/MM/AAAA"
      />
      <span className="text-xs text-ink-mute">até</span>
      <CampoDataBR
        value={ate}
        onChange={(valor) => aoMudar(de, valor)}
        className={cls}
        ariaLabel="Data final no formato DD/MM/AAAA"
      />
      <button type="button" onClick={() => aoMudar(hoje, hoje)} className={CHIP}>
        Hoje
      </button>
      <button type="button" onClick={() => aoMudar(inicioMes, hoje)} className={CHIP}>
        Este mês
      </button>
      <button type="button" onClick={() => aoMudar(diasAtrasBR(30), hoje)} className={CHIP}>
        30 dias
      </button>
    </div>
  );
}

export function LinhaVazia({
  colunas,
  carregando,
  mensagem,
}: {
  colunas: number;
  carregando: boolean;
  mensagem: string;
}) {
  return (
    <tr>
      <td colSpan={colunas} className="py-10 text-center text-sm text-ink-mute">
        {carregando ? "Carregando dados…" : mensagem}
      </td>
    </tr>
  );
}

export function PainelRelatorio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6 print:border-none print:p-0 print:shadow-none">
      {children}
    </div>
  );
}

export function RodapeImpressao() {
  return (
    <div className="mt-8 border-t border-line pt-4 text-center text-xs text-ink-mute">
      <p>
        Documento oficial emitido pelo Sistema de Controle de Saídas — {NOME_UNIDADE} ·{" "}
        {SETOR_RESPONSAVEL}
      </p>
    </div>
  );
}
