"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Saida } from "@/db/schema";
import { TIPOS, type DadosSaida } from "@/lib/constantes";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import { dataBRParaISO, dataLongaBR, formatarDataBR, hojeISO } from "@/lib/format";
import CampoDataBR from "./CampoDataBR";
import SaidaModal from "./SaidaModal";
import Sidebar, { type AbaNavegacao } from "./Sidebar";
import Brasao from "./Brasao";
import ImportarPlanilha from "./ImportarPlanilha";
import PainelAdminDashboard from "./PainelAdminDashboard";
import Relatorios from "./relatorios/Relatorios";
import ToastStack, { type Toast } from "./Toasts";
import TypeBadge from "./TypeBadge";
import {
  IconeBusca,
  IconeCheck,
  IconeDireita,
  IconeDownload,
  IconeEsquerda,
  IconeLapis,
  IconeLixeira,
  IconeLimpar,
  IconeMais,
  IconeOrdenar,
  IconePrancheta,
  IconeUpload,
} from "./Icons";

interface Resumo {
  total: number;
  hoje: number;
  mes: number;
  porRegime: Record<string, number>;
}

interface DadosLista {
  itens: Saida[];
  total: number;
  pagina: number;
  paginas: number;
  resumo: Resumo;
  locais: string[];
}

type CampoOrdenacao = "data" | "hora" | "nome" | "local";

const POR_PAGINA = 25;

interface OperadorLogado {
  nome: string;
  rs: string;
}

export default function Dashboard({
  operador,
  ehAdmin,
}: {
  operador: OperadorLogado;
  ehAdmin: boolean;
}) {
  const router = useRouter();

  // ----- navegação por abas -----
  // O operador começa diretamente em "Saídas Cadastradas".
  // Dashboard e Relatório são exclusivos do administrador.
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>(() =>
    ehAdmin ? "dashboard" : "saidas"
  );
  const [menuAbertoMobile, setMenuAbertoMobile] = useState(false);

  // ----- filtros -----
  const [q, setQ] = useState("");
  const [qBusca, setQBusca] = useState("");
  const [fLocal, setFLocal] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fDe, setFDe] = useState("");
  const [fAte, setFAte] = useState("");

  // ----- paginação e ordenação -----
  const [pagina, setPagina] = useState(1);
  const [orden, setOrden] = useState<{ campo: CampoOrdenacao; dir: "asc" | "desc" }>({
    campo: "data",
    dir: "desc",
  });

  // ----- estado de dados -----
  const [dados, setDados] = useState<DadosLista | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);

  // ----- modal / toasts / exclusão -----
  const [modal, setModal] = useState<{ aberto: boolean; editando: Saida | null }>({
    aberto: false,
    editando: null,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const timerConfirm = useRef<number | null>(null);
  const [exportando, setExportando] = useState(false);
  const [importarAberto, setImportarAberto] = useState(false);

  // debounce da busca
  useEffect(() => {
    const t = window.setTimeout(() => setQBusca(q.trim()), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  // qualquer filtro volta para a página 1
  useEffect(() => {
    setPagina(1);
  }, [qBusca, fLocal, fTipo, fDe, fAte]);

  function avisar(tipo: Toast["tipo"], msg: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, tipo, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }

  async function sair() {
    await fetch("/api/auth/sair", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function tratarNaoAutenticado(status: number) {
    if (status === 401) {
      avisar("erro", "Sua sessão expirou. Faça login novamente.");
      router.replace("/login");
      return true;
    }
    return false;
  }

  function paramsBase(perPage: number, paginaAtual: number) {
    const p = new URLSearchParams({
      page: String(paginaAtual),
      perPage: String(perPage),
      sort: orden.campo,
      dir: orden.dir,
    });
    if (qBusca) p.set("q", qBusca);
    if (fLocal) p.set("local", fLocal);
    if (fTipo) p.set("tipo", fTipo);
    if (fDe) p.set("de", fDe);
    if (fAte) p.set("ate", fAte);
    return p;
  }

  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  const buscar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCarregando(true);
      try {
        const r = await fetch(`/api/saidas?${paramsBase(POR_PAGINA, pagina).toString()}`);
        if (!r.ok) {
          if (tratarNaoAutenticado(r.status)) return;
          throw new Error("falha");
        }
        const corpo = (await r.json()) as DadosLista;
        setDados(corpo);
        setUltimaAtualizacao(new Date());
      } catch {
        if (!silencioso) avisar("erro", "Não foi possível carregar os registros.");
      } finally {
        if (!silencioso) setCarregando(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [qBusca, fLocal, fTipo, fDe, fAte, pagina, orden]
  );

  useEffect(() => {
    void buscar();
  }, [buscar, recarga]);

  // Atualização automática: mantém todos os computadores sincronizados.
  // Pausa quando o modal está aberto ou a aba está oculta.
  const modalAberto = modal.aberto;
  useEffect(() => {
    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible" && !modalAberto) {
        void buscar(true);
      }
    }, 5000);
    return () => window.clearInterval(intervalo);
  }, [buscar, modalAberto]);

  // ----- ações -----
  async function aoSalvar(dadosForm: DadosSaida, id?: number): Promise<boolean> {
    try {
      // Administradores podem editar (PUT); criação usa POST.
      const r = await fetch(id ? `/api/saidas/${id}` : "/api/saidas", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosForm),
      });
      const corpo = await r.json();
      if (!r.ok) {
        const msg =
          corpo && typeof corpo === "object" && corpo.erros
            ? Object.values(corpo.erros as Record<string, string>)
                .map((v) => v.toLowerCase())
                .join(" ")
            : corpo?.erro || "erro ao salvar";
        avisar("erro", msg.charAt(0).toUpperCase() + msg.slice(1));
        return false;
      }
      avisar("ok", id ? "Saída atualizada com sucesso." : "Saída cadastrada com sucesso.");
      setModal({ aberto: false, editando: null });
      setRecarga((n) => n + 1);
      return true;
    } catch {
      avisar("erro", "Falha de conexão ao salvar. Tente novamente.");
      return false;
    }
  }

  function pedirExclusao(id: number) {
    if (confirmandoId === id) {
      void excluir(id);
      return;
    }
    setConfirmandoId(id);
    if (timerConfirm.current) window.clearTimeout(timerConfirm.current);
    timerConfirm.current = window.setTimeout(() => setConfirmandoId(null), 4000);
  }

  async function excluir(id: number) {
    setConfirmandoId(null);
    try {
      const r = await fetch(`/api/saidas/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      avisar("ok", "Saída excluída.");
      setRecarga((n) => n + 1);
    } catch {
      avisar("erro", "Não foi possível excluir o registro.");
    }
  }

  async function exportarCSV() {
    setExportando(true);
    try {
      const r = await fetch(`/api/saidas?${paramsBase(100000, 1).toString()}`);
      if (!r.ok) throw new Error();
      const corpo = (await r.json()) as DadosLista;
      const adminCols = ehAdmin ? ["Veículo", "Motorista", "Cadastrado por"] : [];
      const cab = [
        "Data",
        "Hora",
        "Local",
        "Matrícula",
        "Nome",
        "Motivo",
        "Regime",
        "Status",
        "Justificativa",
        ...adminCols,
      ];
      const linhas = [
        cab.join(";"),
        ...corpo.itens.map((s) =>
          [
            s.data.split("-").reverse().join("/"),
            s.hora,
            s.local,
            s.matricula,
            s.nome,
            s.motivo,
            s.regime,
            s.naoRealizada ? "NÃO REALIZADA" : "REALIZADA",
            s.justificativa,
            ...(ehAdmin ? [s.veiculo, s.motorista, s.criadoPorNome] : []),
          ]
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
      a.download = `saidas-${hojeISO()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      avisar("ok", `${corpo.total} registro(s) exportado(s) para CSV.`);
    } catch {
      avisar("erro", "Falha ao exportar o arquivo CSV.");
    } finally {
      setExportando(false);
    }
  }

  function alternarOrdem(campo: CampoOrdenacao) {
    setOrden((o) =>
      o.campo === campo
        ? { campo, dir: o.dir === "asc" ? "desc" : "asc" }
        : { campo, dir: campo === "data" ? "desc" : "asc" }
    );
  }

  const temFiltros = Boolean(qBusca || fLocal || fTipo || fDe || fAte);
  function limparFiltros() {
    setQ("");
    setQBusca("");
    setFLocal("");
    setFTipo("");
    setFDe("");
    setFAte("");
  }

  const resumo = dados?.resumo;
  const itens = dados?.itens ?? [];
  const total = dados?.total ?? 0;
  const paginas = dados?.paginas ?? 1;
  const hoje = hojeISO();
  const inicioPagina = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const fimPagina = Math.min(total, pagina * POR_PAGINA);

  const selectCls =
    "h-9 rounded-lg border border-line-strong bg-white/70 px-2.5 text-sm text-ink outline-none transition-shadow focus:ring-2 focus:ring-pine-300";

  function CabecalhoOrdenavel({
    label,
    campo,
    className = "",
  }: {
    label: string;
    campo: CampoOrdenacao;
    className?: string;
  }) {
    const ativo = orden.campo === campo;
    return (
      <th className={`px-3 py-2.5 ${className}`}>
        <button
          type="button"
          onClick={() => alternarOrdem(campo)}
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            ativo ? "text-pine-700" : "text-ink-mute hover:text-ink"
          }`}
          title={`Ordenar por ${label.toLowerCase()}`}
        >
          {label}
          {ativo ? (
            <span className="text-[10px] leading-none">{orden.dir === "asc" ? "▲" : "▼"}</span>
          ) : (
            <IconeOrdenar className="size-3 opacity-50" />
          )}
        </button>
      </th>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ---------- Menu Lateral (Sidebar) ---------- */}
      <Sidebar
        abaAtiva={abaAtiva}
        aoMudarAba={(aba) => setAbaAtiva(aba)}
        aoAbrirNovaSaida={() => setModal({ aberto: true, editando: null })}
        operador={operador}
        ehAdmin={ehAdmin}
        aoSair={() => void sair()}
        menuAbertoMobile={menuAbertoMobile}
        setMenuAbertoMobile={setMenuAbertoMobile}
      />

      {/* ---------- Conteúdo Principal à Direita da Sidebar ---------- */}
      <div className="pt-14 lg:pt-0 lg:pl-64 transition-all print:p-0 print:pl-0 print:pt-0">
        {/* Banner Superior da Página */}
        <header className="border-b border-line bg-surface px-4 py-4 sm:px-8 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Brasao className="size-11 shrink-0" />
              <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-ink">
                {abaAtiva === "dashboard" && "Dashboard"}
                {abaAtiva === "saidas" && "Saídas Cadastradas"}
                {abaAtiva === "relatorio" && "Relatórios"}
              </h1>
              <p className="text-xs text-ink-mute">
                {NOME_UNIDADE} · {SETOR_RESPONSAVEL}
              </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft"
                title="Os dados são atualizados automaticamente a cada 5 segundos em todos os computadores conectados"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pine-300 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-pine-600" />
                </span>
                Sincronização ativa
              </span>
              <span className="font-display text-xs font-semibold capitalize text-ink-soft bg-paper px-3 py-1.5 rounded-lg border border-line">
                {dataLongaBR()}
              </span>
              <button
                type="button"
                onClick={() => setModal({ aberto: true, editando: null })}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-pine-700 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-pine-800"
              >
                <IconeMais className="size-4" />
                Nova Saída
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 print:p-0">
          {/* ABA RELATÓRIOS (menu com vários relatórios para administradores) */}
          {abaAtiva === "relatorio" && (
            <Relatorios usuarioNome={operador.nome} />
          )}

          {/* ABA DASHBOARD (somente administradores): visão geral com gráficos */}
          {abaAtiva === "dashboard" && ehAdmin && <PainelAdminDashboard />}

          {/* ABA SAÍDAS CADASTRADAS */}
          {abaAtiva === "saidas" && (
            <>
              {/* Indicadores */}
              <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                    Total de saídas
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">
                    {carregando && !dados ? "—" : (resumo?.total ?? 0).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
                  <span className="absolute inset-y-0 left-0 w-1 bg-hl-300" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                    Saídas hoje
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">
                    {carregando && !dados ? "—" : (resumo?.hoje ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                    Mês atual
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">
                    {carregando && !dados ? "—" : (resumo?.mes ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                    Saídas por regime
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {TIPOS.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white/60 px-2 py-1 text-xs"
                      >
                        <TypeBadge tipo={t} />
                        <b className="font-display tabular-nums">{resumo?.porRegime?.[t] ?? 0}</b>
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Barra de Ferramentas / Filtros */}
              <section
                aria-label="Filtros e ações"
                className="mt-5 flex flex-col gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[210px] flex-1">
                    <IconeBusca className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                    <input
                      type="search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por nome, matrícula, local ou procedimento…"
                      className="h-9 w-full rounded-lg border border-line-strong bg-white/70 pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-pine-300"
                      aria-label="Buscar saídas"
                    />
                  </div>

                  <select
                    value={fLocal}
                    onChange={(e) => setFLocal(e.target.value)}
                    className={`${selectCls} max-w-[220px]`}
                    aria-label="Filtrar por local"
                  >
                    <option value="">Local: todos</option>
                    {(dados?.locais ?? []).map((l) => (
                      <option key={l} value={l}>
                        {l.length > 42 ? l.slice(0, 42) + "…" : l}
                      </option>
                    ))}
                  </select>

                  <select
                    value={fTipo}
                    onChange={(e) => setFTipo(e.target.value)}
                    className={selectCls}
                    aria-label="Filtrar por regime"
                  >
                    <option value="">Regime: todos</option>
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <CampoDataBR
                      value={fDe}
                      onChange={setFDe}
                      className={`${selectCls} w-32 font-display tabular-nums`}
                      ariaLabel="Data inicial no formato DD/MM/AAAA"
                      title="Data inicial — DD/MM/AAAA"
                    />
                    <span className="text-xs text-ink-mute">até</span>
                    <CampoDataBR
                      value={fAte}
                      onChange={setFAte}
                      className={`${selectCls} w-32 font-display tabular-nums`}
                      ariaLabel="Data final no formato DD/MM/AAAA"
                      title="Data final — DD/MM/AAAA"
                    />
                  </div>

                  {temFiltros && (
                    <button
                      type="button"
                      onClick={limparFiltros}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-cr-700 transition-colors hover:bg-cr-100/60"
                    >
                      <IconeLimpar className="size-4" />
                      Limpar
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {ehAdmin && (
                      <button
                        type="button"
                        onClick={() => setImportarAberto(true)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-pine-200 bg-pine-50 px-3 text-sm font-semibold text-pine-700 transition-colors hover:bg-pine-100"
                        title="Importar planilha Excel/CSV com saídas (somente administrador)"
                      >
                        <IconeUpload className="size-4" />
                        Importar planilha
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={exportarCSV}
                      disabled={exportando || total === 0}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-white/70 px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-line/50 disabled:opacity-50"
                      title="Baixar os registros filtrados em CSV (compatível com Excel)"
                    >
                      <IconeDownload className="size-4" />
                      {exportando ? "Exportando…" : "Exportar CSV"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ aberto: true, editando: null })}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-pine-700 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800"
                    >
                      <IconeMais className="size-4" />
                      Nova saída
                    </button>
                  </div>
                </div>
              </section>

              {/* Tabela Principal */}
              <section
                aria-label="Lista de saídas"
                className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] border-collapse text-sm">
                    <thead className="bg-paper/70">
                      <tr className="text-left">
                        <CabecalhoOrdenavel label="Data" campo="data" className="w-28" />
                        <CabecalhoOrdenavel label="Hora" campo="hora" className="w-20" />
                        <CabecalhoOrdenavel label="Local de destino" campo="local" />
                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                          Matrícula
                        </th>
                        <CabecalhoOrdenavel label="Nome" campo="nome" />
                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                          Motivo / Procedimento
                        </th>
                        <th className="w-16 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                          Regime
                        </th>
                        {ehAdmin && (
                          <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                            Veículo / Motorista
                          </th>
                        )}
                        {ehAdmin && (
                          <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                            Cadastrado por
                          </th>
                        )}
                        {ehAdmin && (
                          <th className="w-24 px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                            Ações
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody
                      className={`transition-opacity ${
                        carregando && dados ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {carregando && !dados ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <tr key={i} className="border-t border-line">
                            {Array.from({ length: ehAdmin ? 10 : 7 }).map((_, j) => (
                              <td key={j} className="px-3 py-3">
                                <div
                                  className="h-3.5 animate-pulse rounded bg-line/80"
                                  style={{ width: `${50 + ((i * 17 + j * 29) % 45)}%` }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : itens.length === 0 ? (
                      <tr>
                        <td colSpan={ehAdmin ? 10 : 7}>
                          {total === 0 ? (
                              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                                <span className="grid size-12 place-items-center rounded-xl bg-paper text-ink-mute ring-1 ring-line">
                                  <IconePrancheta className="size-6" />
                                </span>
                                <div>
                                  <p className="font-display text-base font-semibold">
                                    Nenhuma saída cadastrada ainda
                                  </p>
                                  <p className="mt-1 max-w-md text-sm text-ink-mute">
                                    Cadastre a primeira saída usando o botão abaixo.
                                    {ehAdmin
                                      ? "Como administrador, você verá aqui todas as saídas cadastradas por qualquer pessoa."
                                      : "Você só verá aqui as saídas registradas por você."}
                                  </p>
                                </div>
                                <div className="mt-1 flex flex-wrap justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setModal({ aberto: true, editando: null })}
                                    className="inline-flex items-center gap-2 rounded-lg bg-pine-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800"
                                  >
                                    <IconeMais className="size-4" />
                                    Cadastrar primeira saída
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                                <span className="grid size-12 place-items-center rounded-xl bg-paper text-ink-mute ring-1 ring-line">
                                  <IconeBusca className="size-6" />
                                </span>
                                <div>
                                  <p className="font-display text-base font-semibold">
                                    Nenhum resultado com os filtros atuais
                                  </p>
                                  <p className="mt-1 text-sm text-ink-mute">
                                    Tente ajustar a busca, o local, o código ou o período.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={limparFiltros}
                                  className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-white/70 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-line/50"
                                >
                                  <IconeLimpar className="size-4" />
                                  Limpar filtros
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        itens.map((s) => {
                          const ehHoje = s.data === hoje;
                          return (
                            <tr
                              key={s.id}
                              className={`border-t border-line align-top transition-colors ${
                                s.naoRealizada
                                  ? "bg-cr-100/40 hover:bg-cr-100/60"
                                  : ehHoje
                                    ? "bg-hl-100/45 hover:bg-hl-100/70"
                                    : "hover:bg-paper/60"
                              }`}
                            >
                              <td className="whitespace-nowrap px-3 py-2.5 font-display tabular-nums">
                                <span className="inline-flex items-center gap-1.5">
                                  {ehHoje && (
                                    <span
                                      className="size-1.5 rounded-full bg-hl-500"
                                      title="Saída de hoje"
                                    />
                                  )}
                                  {formatarDataBR(s.data)}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2.5 font-display tabular-nums text-ink-soft">
                                {s.hora}
                              </td>
                              <td className="max-w-[240px] px-3 py-2.5" title={s.local}>
                                <span className="block truncate font-medium">{s.local}</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-ink-soft">
                                {s.matricula}
                              </td>
                              <td className="max-w-[220px] px-3 py-2.5" title={s.nome}>
                                <span className="block truncate font-semibold">{s.nome}</span>
                              </td>
                              <td className="max-w-[260px] px-3 py-2.5 text-ink-soft" title={s.motivo}>
                                <span className={`block truncate ${s.naoRealizada ? "line-through opacity-70" : ""}`}>
                                  {s.motivo || "—"}
                                </span>
                                {s.naoRealizada && (
                                  <span
                                    className="mt-0.5 block truncate text-[11px] font-bold text-cr-700"
                                    title={s.justificativa || "Saída não realizada"}
                                  >
                                    NÃO REALIZADA{s.justificativa ? ` · ${s.justificativa}` : ""}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <TypeBadge tipo={s.regime} />
                              </td>
                              {ehAdmin && (
                                <td
                                  className="max-w-[200px] px-3 py-2.5"
                                  title={
                                    s.veiculo || s.motorista
                                      ? `${s.veiculo || "—"} · ${s.motorista || "—"}`
                                      : undefined
                                  }
                                >
                                  <span className="block truncate text-sm font-medium text-ink">
                                    {s.veiculo || "—"}
                                  </span>
                                  <span className="block truncate text-[11px] text-ink-mute">
                                    {s.motorista || ""}
                                  </span>
                                </td>
                              )}
                              {ehAdmin && (
                                <td
                                  className="max-w-[180px] px-3 py-2.5 text-ink-soft"
                                  title={`${s.criadoPorNome} · RS ${s.criadoPorRs}`}
                                >
                                  <span className="block truncate">{s.criadoPorNome}</span>
                                  <span className="block truncate text-[11px] text-ink-mute">
                                    RS {s.criadoPorRs}
                                  </span>
                                </td>
                              )}
                              {ehAdmin && (
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-end gap-1">
                                  {confirmandoId === s.id ? (
                                    <button
                                      type="button"
                                      onClick={() => void excluir(s.id)}
                                      className="inline-flex items-center gap-1 rounded-md bg-cr-700 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-cr-800"
                                    >
                                      <IconeCheck className="size-3.5" />
                                      Confirmar
                                    </button>
                                  ) : (
                                    <>
                                      {ehAdmin && (
                                        <button
                                          type="button"
                                          onClick={() => setModal({ aberto: true, editando: s })}
                                          className="rounded-md p-1.5 text-ink-mute transition-colors hover:bg-pine-50 hover:text-pine-700"
                                          aria-label={`Editar saída de ${s.nome}`}
                                          title="Editar (administrador)"
                                        >
                                          <IconeLapis className="size-4" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => pedirExclusao(s.id)}
                                        className="rounded-md p-1.5 text-ink-mute transition-colors hover:bg-cr-100/70 hover:text-cr-700"
                                        aria-label={`Excluir saída de ${s.nome}`}
                                        title="Excluir"
                                      >
                                        <IconeLixeira className="size-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Rodapé / Paginação */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper/50 px-4 py-3">
                  <p className="text-xs text-ink-mute">
                    Mostrando{" "}
                    <b className="text-ink-soft">
                      {inicioPagina}–{fimPagina}
                    </b>{" "}
                    de <b className="text-ink-soft">{total.toLocaleString("pt-BR")}</b> saídas
                    <span className="ml-2 hidden sm:inline">
                      · Regimes: <b className="text-sa-700">RSA</b> · <b className="text-stone-600">FE</b> ·{" "}
                      <b className="text-cr-700">CR</b> · <b className="text-amber-700">OUTRO</b> (conforme planilha)
                    </span>
                    {ultimaAtualizacao && (
                      <span className="ml-2 hidden md:inline">
                        · Atualizado automaticamente às{" "}
                        <b className="text-ink-soft">{ultimaAtualizacao.toLocaleTimeString("pt-BR")}</b>
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={pagina <= 1}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-line-strong bg-white/70 px-2.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-line/50 disabled:opacity-40"
                    >
                      <IconeEsquerda className="size-3.5" />
                      Anterior
                    </button>
                    <span className="px-1.5 font-display text-xs font-semibold tabular-nums text-ink-soft">
                      {pagina} / {paginas}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                      disabled={pagina >= paginas}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-line-strong bg-white/70 px-2.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-line/50 disabled:opacity-40"
                    >
                      Próxima
                      <IconeDireita className="size-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* ---------- modal ---------- */}
      {importarAberto && ehAdmin && (
        <ImportarPlanilha
          aoFechar={() => setImportarAberto(false)}
          aoConcluir={() => setRecarga((n) => n + 1)}
          avisar={avisar}
        />
      )}

      {modal.aberto && (
        <SaidaModal
          key={modal.editando ? `edicao-${modal.editando.id}` : "nova-saida"}
          editando={modal.editando}
          ehAdmin={ehAdmin}
          locais={dados?.locais ?? []}
          aoFechar={() => setModal({ aberto: false, editando: null })}
          aoSalvar={aoSalvar}
        />
      )}

      <ToastStack
        toasts={toasts}
        aoFechar={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />
    </div>
  );
}
