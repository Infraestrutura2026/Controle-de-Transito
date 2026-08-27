"use client";

import { useEffect, useMemo, useState } from "react";
import type { Saida } from "@/db/schema";
import { dataBRParaISO, formatarDataBR, hojeBR } from "@/lib/format";
import { IconeDownload, IconeImpressora } from "./Icons";
import CampoDataBR from "./CampoDataBR";
import TabelaPlanilha, { montarLinhasPlanilha } from "./TabelaPlanilha";
import { Cartao, baixarCSV } from "./relatorios/comum";

/**
 * Relatório Diário de Saídas — documento no formato da planilha física
 * (componente TabelaPlanilha). Os controles e o resumo de apoio aparecem
 * apenas na tela; a impressão/exportação reproduz a folha do setor.
 */
export default function RelatorioDiario({ usuarioNome }: { usuarioNome: string }) {
  const [dataSel, setDataSel] = useState(() => hojeBR());
  const [itens, setItens] = useState<Saida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoAs, setAtualizadoAs] = useState<string | null>(null);

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
      const corpo = (await r.json()) as { itens?: Saida[] };
      setItens(corpo.itens ?? []);
      setAtualizadoAs(
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      if (!silencioso) setItens([]);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSel]);

  // Atualização automática: mantém a planilha em dia em todos os computadores.
  useEffect(() => {
    const intervalo = window.setInterval(() => void carregar(true), 10000);
    return () => window.clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSel]);

  const linhas = useMemo(() => montarLinhasPlanilha(itens), [itens]);

  const porRegime = useMemo(() => {
    const c: Record<string, number> = { SA: 0, FE: 0, CR: 0 };
    for (const s of itens) c[s.regime] = (c[s.regime] ?? 0) + 1;
    return c;
  }, [itens]);

  const porLocal = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of itens) m[s.local] = (m[s.local] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [itens]);

  function exportarCSV() {
    if (linhas.length === 0) return;
    baixarCSV(
      `planilha-diaria-${dataBRParaISO(dataSel)}.csv`,
      ["Nº", "Data", "Hora", "Local", "Matrícula", "Nome", "Motivo", "Regime", "Observações"],
      linhas.map((l) => [
        String(l.numero),
        l.data,
        l.hora,
        l.local,
        l.matricula,
        l.nome,
        l.motivo,
        l.regime,
        l.obs,
      ])
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de controle (só na tela) */}
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
          <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-mute">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pine-300 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-pine-600" />
            </span>
            Atualiza automaticamente a cada 10 segundos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            disabled={linhas.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-white/70 px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-line/50 disabled:opacity-50"
          >
            <IconeDownload className="size-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={carregando}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-pine-700 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800 disabled:opacity-50"
          >
            <IconeImpressora className="size-4" />
            Imprimir Planilha
          </button>
        </div>
      </div>

      {/* Resumo de apoio (só na tela — não vai para a folha impressa) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:hidden">
        <Cartao rotulo="Total de saídas" valor={itens.length} />
        <Cartao rotulo="Regime SA" valor={porRegime.SA} tom="azul" />
        <Cartao rotulo="Regime FE" valor={porRegime.FE} tom="neutro" />
        <Cartao rotulo="Regime CR" valor={porRegime.CR} tom="vermelho" />
      </div>

      {porLocal.length > 0 && (
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm print:hidden">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-tight text-ink">
              Quantidade de saídas por local
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              {porLocal.length} {porLocal.length === 1 ? "local" : "locais"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {porLocal.map(([local, qtd]) => (
              <div
                key={local}
                className="flex items-center justify-between rounded-lg border border-line bg-paper/50 px-3 py-2"
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
        </div>
      )}

      {/* O documento: réplica da planilha física */}
      <TabelaPlanilha
        titulo="Planilha de Controle de Saídas"
        contexto={`Movimento do dia ${formatarDataBR(dataSel)}`}
        linhas={linhas}
        carregando={carregando}
        usuarioNome={usuarioNome}
        atualizadoAs={atualizadoAs}
        minimoLinhas={15}
        rotuloTotais="Total de saídas no dia"
        totais={{ SA: porRegime.SA, FE: porRegime.FE, CR: porRegime.CR }}
      />
    </div>
  );
}
