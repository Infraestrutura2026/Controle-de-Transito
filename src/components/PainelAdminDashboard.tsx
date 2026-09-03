"use client";

import { useMemo } from "react";
import type { Saida } from "@/db/schema";
import { hojeISO } from "@/lib/format";
import { useSaidas } from "./relatorios/comum";
import TypeBadge from "./TypeBadge";
import {
  IconeDireita,
  IconeEscudo,
  IconePrancheta,
  IconeRelogio,
  IconeUsuarios,
} from "./Icons";

function isoDe(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function CartaoKpi({
  rotulo,
  valor,
  sub,
  icone,
  tom,
}: {
  rotulo: string;
  valor: string | number;
  sub?: string;
  icone: React.ReactNode;
  tom: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">{rotulo}</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">{valor}</p>
          {sub ? <p className="mt-1 text-[11px] font-medium text-ink-mute">{sub}</p> : null}
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tom}`}>{icone}</span>
      </div>
    </div>
  );
}

export default function PainelAdminDashboard() {
  const { itens, carregando } = useSaidas({});

  const stats = useMemo(() => {
    const hoje = hojeISO();
    const agora = new Date();
    const mesAtual = hoje.slice(0, 7);
    const dPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const mesPassado = `${dPassado.getFullYear()}-${String(dPassado.getMonth() + 1).padStart(2, "0")}`;

    let nHoje = 0;
    let nMes = 0;
    let nMesPassado = 0;
    const pessoas = new Set<string>();
    const porRegime: Record<string, number> = { SA: 0, FE: 0, CR: 0, OUTRO: 0 };
    const porData = new Map<string, number>();
    const porLocal = new Map<string, number>();

    for (const s of itens) {
      if (s.data === hoje) nHoje++;
      if (s.data.startsWith(mesAtual)) nMes++;
      if (s.data.startsWith(mesPassado)) nMesPassado++;
      pessoas.add(`${s.matricula}|${s.nome.trim().toUpperCase()}`);
      porRegime[s.regime] = (porRegime[s.regime] ?? 0) + 1;
      porData.set(s.data, (porData.get(s.data) ?? 0) + 1);
      porLocal.set(s.local, (porLocal.get(s.local) ?? 0) + 1);
    }

    // últimos 7 dias
    const ultimos7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = isoDe(d);
      return {
        iso,
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        dia: d.getDate(),
        total: porData.get(iso) ?? 0,
      };
    });
    const max7 = Math.max(1, ...ultimos7.map((u) => u.total));

    const topLocais = [...porLocal.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([local, total]) => ({ local, total }));
    const maxLocal = Math.max(1, ...topLocais.map((l) => l.total));

    const ultimas = [...itens]
      .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora) || b.id - a.id)
      .slice(0, 6);

    const deltaMes = nMes - nMesPassado;

    return {
      total: itens.length,
      nHoje,
      nMes,
      nMesPassado,
      deltaMes,
      pessoas: pessoas.size,
      porRegime,
      ultimos7,
      max7,
      topLocais,
      maxLocal,
      ultimas,
    };
  }, [itens]);

  const pctRegime = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CartaoKpi
          rotulo="Total de saídas"
          valor={carregando && !itens.length ? "—" : stats.total}
          sub={`${stats.pessoas} pessoa(s) distinta(s)`}
          icone={<IconePrancheta className="size-5 text-white" />}
          tom="bg-pine-600"
        />
        <CartaoKpi
          rotulo="Saídas hoje"
          valor={stats.nHoje}
          sub="registradas no dia de hoje"
          icone={<IconeRelogio className="size-5 text-white" />}
          tom="bg-hl-500"
        />
        <CartaoKpi
          rotulo="Mês atual"
          valor={stats.nMes}
          sub={
            stats.deltaMes === 0
              ? `mesmo volume que o mês passado (${stats.nMesPassado})`
              : stats.deltaMes > 0
                ? `+${stats.deltaMes} em relação ao mês passado`
                : `${stats.deltaMes} em relação ao mês passado`
          }
          icone={<IconeDireita className="size-5 text-white" />}
          tom={stats.deltaMes >= 0 ? "bg-sa-700" : "bg-cr-700"}
        />
        <CartaoKpi
          rotulo="Regimes (total)"
          valor={`${stats.porRegime.SA}/${stats.porRegime.FE}/${stats.porRegime.CR}/${stats.porRegime.OUTRO}`}
          sub="SA · FE · CR · OUTRO"
          icone={<IconeEscudo className="size-5 text-white" />}
          tom="bg-ink"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {/* Gráfico últimos 7 dias */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-tight text-ink">
              Saídas nos últimos 7 dias
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              por data
            </span>
          </div>
          <div className="flex h-40 items-end gap-2">
            {stats.ultimos7.map((d) => (
              <div key={d.iso} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-bold tabular-nums text-ink-soft">
                  {d.total > 0 ? d.total : ""}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.iso === hojeISO() ? "bg-hl-500" : "bg-pine-600/80 hover:bg-pine-600"
                  }`}
                  style={{ height: `${Math.max(4, (d.total / stats.max7) * 100)}%` }}
                  title={`${d.dia}/${new Date(d.iso + "T12:00:00").getMonth() + 1}: ${d.total} saída(s)`}
                />
                <span className="text-[10px] font-semibold capitalize text-ink-mute">
                  {d.label}
                </span>
                <span className="text-[10px] tabular-nums text-ink-mute">{d.dia}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição por regime */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-tight text-ink">
              Distribuição por regime
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              total geral
            </span>
          </div>
          <div className="space-y-4 pt-1">
            {(
              [
                ["SA", stats.porRegime.SA, "bg-sa-700"],
                ["FE", stats.porRegime.FE, "bg-stone-500"],
                ["CR", stats.porRegime.CR, "bg-cr-700"],
                ["OUTRO", stats.porRegime.OUTRO, "bg-amber-500"],
              ] as const
            ).map(([r, n, cor]) => (
              <div key={r}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-bold text-ink-soft">
                    <TypeBadge tipo={r} /> Regime {r}
                  </span>
                  <span className="font-display font-bold tabular-nums text-ink">
                    {n} <span className="text-ink-mute">({pctRegime(n)}%)</span>
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${cor} transition-all`}
                    style={{ width: `${pctRegime(n)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locais mais demandados */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-tight text-ink">
              Locais mais demandados
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              top 5 · total geral
            </span>
          </div>
          {stats.topLocais.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-mute">Nenhuma saída registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {stats.topLocais.map((l) => (
                <div key={l.local}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-semibold text-ink-soft" title={l.local}>
                      {l.local}
                    </span>
                    <span className="shrink-0 font-display font-bold tabular-nums text-ink">
                      {l.total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-pine-600 transition-all"
                      style={{ width: `${(l.total / stats.maxLocal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas saídas registradas */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-tight text-ink">
              Últimas saídas registradas
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              <IconeUsuarios className="size-3.5" /> em tempo real
            </span>
          </div>
          {stats.ultimas.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-mute">Nenhuma saída registrada ainda.</p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.ultimas.map((s: Saida) => (
                <li key={s.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-paper font-display text-xs font-bold tabular-nums text-ink-soft ring-1 ring-line">
                    {s.hora}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{s.nome}</p>
                    <p className="truncate text-[11px] text-ink-mute">
                      {s.local}
                      {s.motivo ? ` · ${s.motivo}` : ""}
                    </p>
                  </div>
                  <TypeBadge tipo={s.regime} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
