"use client";

import { useEffect, useState } from "react";
import type { Saida } from "@/db/schema";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import Brasao from "./Brasao";
import { dataBRParaISO, formatarDataBR, hojeBR } from "@/lib/format";
import CampoDataBR from "./CampoDataBR";
import TypeBadge from "./TypeBadge";
import { IconeDownload, IconeImpressora } from "./Icons";

interface ResumoRelatorio {
  total: number;
  porRegime: Record<string, number>;
  porLocal: Record<string, number>;
  itens: Saida[];
}

export default function RelatorioDiario({
  usuarioNome,
}: {
  usuarioNome: string;
}) {
  const [dataSel, setDataSel] = useState(() => hojeBR());
  const [dados, setDados] = useState<ResumoRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    try {
      const dataISO = dataBRParaISO(dataSel);
      const p = new URLSearchParams({
        de: dataISO,
        ate: dataISO,
        perPage: "1000",
        sort: "hora",
        dir: "asc",
      });
      const r = await fetch(`/api/saidas?${p.toString()}`);
      if (!r.ok) throw new Error();
      const corpo = await r.json();
      const itens: Saida[] = corpo.itens ?? [];
      const porRegime: Record<string, number> = { SA: 0, FE: 0, CR: 0 };
      const porLocal: Record<string, number> = {};

      for (const s of itens) {
        porRegime[s.regime] = (porRegime[s.regime] ?? 0) + 1;
        porLocal[s.local] = (porLocal[s.local] ?? 0) + 1;
      }

      setDados({
        total: itens.length,
        porRegime,
        porLocal,
        itens,
      });
    } catch {
      if (!silencioso) setDados(null);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSel]);

  // Atualização automática: mantém o relatório em dia em todos os computadores.
  useEffect(() => {
    const intervalo = window.setInterval(() => void carregar(true), 10000);
    return () => window.clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSel]);

  function imprimir() {
    window.print();
  }

  function exportarCSVRelatorio() {
    if (!dados || dados.itens.length === 0) return;
    const cab = ["Data", "Hora", "Local", "Motivo", "Regime", "Quantidade por Local"];
    const linhas = [
      cab.join(";"),
      ...dados.itens.map((s) =>
        [formatarDataBR(s.data), s.hora, s.local, s.motivo, s.regime, String(porLocal[s.local] ?? 0)]
          .map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`)
          .join(";")
      ),
    ];
    const blob = new Blob(["\uFEFF" + linhas.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-diario-${dataBRParaISO(dataSel)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const itens = dados?.itens ?? [];
  const porRegime = dados?.porRegime ?? { SA: 0, FE: 0, CR: 0 };
  const porLocal = dados?.porLocal ?? {};
  const locaisOrdenados = Object.entries(porLocal).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {/* Barra de controle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="f-data-relatorio" className="text-sm font-semibold text-ink-soft">
            Data do Relatório:
          </label>
          <CampoDataBR
            id="f-data-relatorio"
            value={dataSel}
            onChange={setDataSel}
            ariaLabel="Data do relatório no formato DD/MM/AAAA"
            className="h-9 w-32 rounded-lg border border-line-strong bg-white/80 px-3 text-sm font-display tabular-nums font-semibold outline-none focus:ring-2 focus:ring-pine-300"
          />
          <button
            type="button"
            onClick={() => setDataSel(hojeBR())}
            className="h-9 rounded-lg border border-line-strong bg-white/70 px-3 text-xs font-semibold text-ink-soft transition-colors hover:bg-line/50"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCSVRelatorio}
            disabled={!dados || dados.total === 0}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-white/70 px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-line/50 disabled:opacity-50"
          >
            <IconeDownload className="size-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={imprimir}
            disabled={!dados || dados.total === 0}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-pine-700 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800 disabled:opacity-50"
          >
            <IconeImpressora className="size-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Documento Impresso / Visualizável */}
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
        {/* Cabeçalho do Relatório */}
        <div className="border-b border-line pb-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Brasao className="size-16 shrink-0 drop-shadow-sm" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-pine-700">
                {NOME_UNIDADE.toUpperCase()} · {SETOR_RESPONSAVEL.toUpperCase()}
              </span>
              <h2 className="font-display text-2xl font-bold text-ink">
                Relatório Diário de Saídas
              </h2>
              <p className="text-sm font-medium text-ink-mute">
                Data de referência: <b className="text-ink">{formatarDataBR(dataSel)}</b>
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-ink-mute sm:mt-0 sm:text-right">
            <p className="inline-flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pine-300 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-pine-600" />
              </span>
              Atualiza automaticamente a cada 10 segundos
            </p>
            <p className="mt-1">
              Emissor: <b className="text-ink-soft">{usuarioNome}</b>
            </p>
          </div>
        </div>

        {/* Resumo de Contagem */}
        <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-line bg-paper/50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Total de Saídas</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">{dados?.total ?? 0}</p>
          </div>
          <div className="rounded-lg border border-sa-100 bg-sa-100/30 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sa-700">Regime SA</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-sa-700">{porRegime.SA}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-100/60 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Regime FE</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-stone-800">{porRegime.FE}</p>
          </div>
          <div className="rounded-lg border border-cr-100 bg-cr-100/30 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cr-700">Regime CR</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-cr-700">{porRegime.CR}</p>
          </div>
        </div>

        {/* Quantidade por Local */}
        <div className="mb-5 rounded-xl border border-line bg-paper/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-tight text-ink">
              Quantidade de saídas por local
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              {locaisOrdenados.length} {locaisOrdenados.length === 1 ? "local" : "locais"}
            </span>
          </div>
          {carregando ? (
            <p className="text-sm text-ink-mute">Carregando…</p>
          ) : locaisOrdenados.length === 0 ? (
            <p className="text-sm text-ink-mute">Nenhum local registrado nesta data.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {locaisOrdenados.map(([local, qtd]) => (
                <div
                  key={local}
                  className="flex items-center justify-between rounded-lg border border-line bg-white/70 px-3 py-2.5"
                >
                  <span className="truncate pr-3 text-sm font-semibold text-ink" title={local}>
                    {local}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-pine-100 px-2.5 py-1 text-sm font-bold text-pine-800">
                    <span className="font-display tabular-nums">{qtd}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pine-700">
                      {qtd === 1 ? "saída" : "saídas"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabela de Saídas do Dia */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-line bg-paper/60 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                <th className="py-2.5 px-3 w-16">Hora</th>
                <th className="py-2.5 px-3">Local de Destino</th>
                <th className="py-2.5 px-3">Motivo / Procedimento</th>
                <th className="py-2.5 px-3 text-center w-20">Regime</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-mute">
                    Carregando relatório…
                  </td>
                </tr>
              ) : itens.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-ink-mute">
                    Nenhuma saída cadastrada para o dia {formatarDataBR(dataSel)}.
                  </td>
                </tr>
              ) : (
                itens.map((s) => (
                  <tr key={s.id} className="border-b border-line align-top hover:bg-paper/40">
                    <td className="py-2.5 px-3 font-display tabular-nums font-bold text-ink">
                      {s.hora}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{s.local}</td>
                    <td className="py-2.5 px-3 text-ink-soft">{s.motivo || "—"}</td>
                    <td className="py-2.5 px-3 text-center">
                      <TypeBadge tipo={s.regime} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Impressão */}
        <div className="mt-8 border-t border-line pt-4 text-center text-xs text-ink-mute print:block">
          <p>
            Documento oficial emitido pelo Sistema de Controle de Saídas — {NOME_UNIDADE} ·{" "}
            {SETOR_RESPONSAVEL}
          </p>
        </div>
      </div>
    </div>
  );
}
