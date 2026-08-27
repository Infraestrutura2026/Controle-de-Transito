"use client";

import { useMemo, useState } from "react";
import RelatorioDiario from "../RelatorioDiario";
import TabelaPlanilha, { montarLinhasPlanilha } from "../TabelaPlanilha";
import TypeBadge from "../TypeBadge";
import { TIPOS } from "@/lib/constantes";
import { dataBRParaISO, formatarDataBR, hojeBR } from "@/lib/format";
import {
  IconeBusca,
  IconeMenuDashboard,
  IconeMenuJustificativas,
  IconeMenuMotoristas,
  IconeMenuOperadores,
  IconeMenuPessoas,
  IconeMenuProcedimentos,
  IconeMenuRelatorioDiario,
  IconeMenuSaidasCadastradas,
  IconeMenuVeiculos,
} from "../Icons";
import {
  BotoesRelatorio,
  CabecalhoRelatorio,
  Cartao,
  LinhaVazia,
  PainelRelatorio,
  RodapeImpressao,
  SeletorPeriodo,
  TBL,
  TD,
  TH,
  baixarCSV,
  pct,
  primeiroDiaDoMesBR,
  useSaidas,
} from "./comum";

type TipoRelatorio =
  | "diario"
  | "periodo"
  | "locais"
  | "procedimentos"
  | "pessoas"
  | "operadores"
  | "motoristas"
  | "veiculos"
  | "justificativas";

interface PropsRelatorio {
  usuarioNome: string;
}

const OPCOES: {
  id: TipoRelatorio;
  label: string;
  desc: string;
  Icone: (p: { className?: string }) => React.ReactNode;
}[] = [
  {
    id: "diario",
    label: "Diário",
    desc: "Planilha do dia com todas as saídas, totais por regime e por local.",
    Icone: IconeMenuRelatorioDiario,
  },
  {
    id: "periodo",
    label: "Consolidado por Período",
    desc: "Planilha consolidada entre duas datas, com resumo dia a dia e totais.",
    Icone: IconeMenuDashboard,
  },
  {
    id: "locais",
    label: "Por Local de Destino",
    desc: "Ranking dos hospitais e unidades mais demandados.",
    Icone: IconeMenuSaidasCadastradas,
  },
  {
    id: "procedimentos",
    label: "Por Procedimento / Motivo",
    desc: "Procedimentos mais realizados no período.",
    Icone: IconeMenuProcedimentos,
  },
  {
    id: "pessoas",
    label: "Por Pessoa (Histórico)",
    desc: "Todas as saídas de uma pessoa, por nome ou matrícula.",
    Icone: IconeMenuPessoas,
  },
  {
    id: "operadores",
    label: "Por Operador",
    desc: "Volume de cadastros por servidor responsável.",
    Icone: IconeMenuOperadores,
  },
  {
    id: "motoristas",
    label: "Por Motorista",
    desc: "Saídas atendidas por motorista e veículos utilizados.",
    Icone: IconeMenuMotoristas,
  },
  {
    id: "veiculos",
    label: "Por Veículo",
    desc: "Utilização da frota e motoristas por veículo.",
    Icone: IconeMenuVeiculos,
  },
  {
    id: "justificativas",
    label: "De Justificativas",
    desc: "Saídas não realizadas e seus motivos no período.",
    Icone: IconeMenuJustificativas,
  },
];

function contarRegimes(itens: { regime: string }[]) {
  const c: Record<string, number> = { SA: 0, FE: 0, CR: 0 };
  for (const i of itens) c[i.regime] = (c[i.regime] ?? 0) + 1;
  return c;
}

/* ================================================================
   1) CONSOLIDADO POR PERÍODO
================================================================ */
/**
 * Consolidado por Período — mesma estrutura do documento de papel
 * (TabelaPlanilha), com todas as saídas do período em sequência,
 * numeração contínua, quadro-resumo por dia e faixa de totais.
 */
function RelatorioPeriodo({ usuarioNome }: PropsRelatorio) {
  const [de, setDe] = useState(primeiroDiaDoMesBR());
  const [ate, setAte] = useState(hojeBR());
  const { itens, carregando } = useSaidas({ de, ate });

  const linhas = useMemo(() => montarLinhasPlanilha(itens), [itens]);

  const porDia = useMemo(() => {
    const m = new Map<string, { regime: string }[]>();
    for (const s of itens) {
      const arr = m.get(s.data) ?? [];
      arr.push(s);
      m.set(s.data, arr);
    }
    return [...m.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([data, grupo]) => ({ data, total: grupo.length, reg: contarRegimes(grupo) }));
  }, [itens]);

  const total = itens.length;
  const reg = contarRegimes(itens);
  const locaisDistintos = new Set(itens.map((i) => i.local)).size;
  const pessoasDistintas = new Set(
    itens.map((i) => `${i.matricula}|${i.nome.trim().toUpperCase()}`)
  ).size;

  function exportar() {
    baixarCSV(
      `consolidado-${dataBRParaISO(de)}-a-${dataBRParaISO(ate)}.csv`,
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm print:hidden">
        <SeletorPeriodo de={de} ate={ate} aoMudar={(d, a) => { setDe(d); setAte(a); }} />
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={linhas.length === 0} />
      </div>

      {/* resumo de apoio — só na tela */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 print:hidden">
        <Cartao rotulo="Total de saídas" valor={total} />
        <Cartao rotulo="Regime SA" valor={reg.SA} tom="azul" />
        <Cartao rotulo="Regime FE" valor={reg.FE} tom="neutro" />
        <Cartao rotulo="Regime CR" valor={reg.CR} tom="vermelho" />
        <Cartao rotulo="Locais distintos" valor={locaisDistintos} />
        <Cartao rotulo="Pessoas distintas" valor={pessoasDistintas} />
      </div>

      {/* O documento: mesma réplica da planilha física do relatório diário */}
      <TabelaPlanilha
        titulo="Planilha de Controle de Saídas — Consolidado"
        contexto={`Período de ${formatarDataBR(de)} a ${formatarDataBR(ate)}`}
        linhas={linhas}
        carregando={carregando}
        usuarioNome={usuarioNome}
        minimoLinhas={8}
        rotuloTotais="Total de saídas no período"
        totais={{ SA: reg.SA, FE: reg.FE, CR: reg.CR }}
        resumoPorDia={porDia.map((d) => ({
          data: formatarDataBR(d.data),
          total: d.total,
          sa: d.reg.SA,
          fe: d.reg.FE,
          cr: d.reg.CR,
        }))}
      />
    </div>
  );
}

/* ================================================================
   2) POR LOCAL DE DESTINO
================================================================ */
function RelatorioLocais({ usuarioNome }: PropsRelatorio) {
  const [de, setDe] = useState(primeiroDiaDoMesBR());
  const [ate, setAte] = useState(hojeBR());
  const { itens, carregando } = useSaidas({ de, ate });

  const linhas = useMemo(() => {
    const m = new Map<string, { regime: string }[]>();
    for (const s of itens) {
      const arr = m.get(s.local) ?? [];
      arr.push(s);
      m.set(s.local, arr);
    }
    return [...m.entries()]
      .map(([local, grupo]) => ({ local, total: grupo.length, reg: contarRegimes(grupo) }))
      .sort((a, b) => b.total - a.total || a.local.localeCompare(b.local));
  }, [itens]);

  const total = itens.length;

  function exportar() {
    baixarCSV(
      `locais-${dataBRParaISO(de)}-a-${dataBRParaISO(ate)}.csv`,
      ["Local de destino", "Total", "%", "SA", "FE", "CR"],
      linhas.map((l) => [l.local, String(l.total), pct(l.total, total), String(l.reg.SA), String(l.reg.FE), String(l.reg.CR)])
    );
  }

  return (
    <PainelRelatorio>
      <CabecalhoRelatorio
        titulo="Saídas por Local de Destino"
        subtitulo={`Período: ${formatarDataBR(de)} a ${formatarDataBR(ate)} · ${total} saída(s) no total`}
        usuarioNome={usuarioNome}
      />
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <SeletorPeriodo de={de} ate={ate} aoMudar={(d, a) => { setDe(d); setAte(a); }} />
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={linhas.length === 0} />
      </div>
      <div className="overflow-x-auto">
        <table className={TBL}>
          <thead>
            <tr>
              <th className={TH}>Local de destino</th>
              <th className={`${TH} text-center`}>Total</th>
              <th className={`${TH} text-center`}>%</th>
              <th className={`${TH} text-center`}>SA</th>
              <th className={`${TH} text-center`}>FE</th>
              <th className={`${TH} text-center`}>CR</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <LinhaVazia colunas={6} carregando={carregando} mensagem="Nenhuma saída no período selecionado." />
            ) : (
              linhas.map((l) => (
                <tr key={l.local} className="hover:bg-paper/40">
                  <td className={`${TD} font-semibold text-ink`}>{l.local}</td>
                  <td className={`${TD} text-center font-display font-bold tabular-nums`}>{l.total}</td>
                  <td className={`${TD} text-center tabular-nums text-ink-soft`}>{pct(l.total, total)}</td>
                  <td className={`${TD} text-center tabular-nums text-sa-700`}>{l.reg.SA}</td>
                  <td className={`${TD} text-center tabular-nums text-stone-700`}>{l.reg.FE}</td>
                  <td className={`${TD} text-center tabular-nums text-cr-700`}>{l.reg.CR}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RodapeImpressao />
    </PainelRelatorio>
  );
}

/* ================================================================
   3) POR PROCEDIMENTO / MOTIVO
================================================================ */
function RelatorioProcedimentos({ usuarioNome }: PropsRelatorio) {
  const [de, setDe] = useState(primeiroDiaDoMesBR());
  const [ate, setAte] = useState(hojeBR());
  const { itens, carregando } = useSaidas({ de, ate });

  const linhas = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of itens) {
      const chave = s.motivo?.trim() ? s.motivo.trim().toUpperCase() : "— SEM PROCEDIMENTO —";
      m.set(chave, (m.get(chave) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([motivo, total]) => ({ motivo, total }))
      .sort((a, b) => b.total - a.total || a.motivo.localeCompare(b.motivo));
  }, [itens]);

  const total = itens.length;

  function exportar() {
    baixarCSV(
      `procedimentos-${dataBRParaISO(de)}-a-${dataBRParaISO(ate)}.csv`,
      ["Procedimento / Motivo", "Total", "%"],
      linhas.map((l) => [l.motivo, String(l.total), pct(l.total, total)])
    );
  }

  return (
    <PainelRelatorio>
      <CabecalhoRelatorio
        titulo="Saídas por Procedimento / Motivo"
        subtitulo={`Período: ${formatarDataBR(de)} a ${formatarDataBR(ate)} · ${total} saída(s) no total`}
        usuarioNome={usuarioNome}
      />
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <SeletorPeriodo de={de} ate={ate} aoMudar={(d, a) => { setDe(d); setAte(a); }} />
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={linhas.length === 0} />
      </div>
      <div className="overflow-x-auto">
        <table className={TBL}>
          <thead>
            <tr>
              <th className={TH}>Procedimento / Motivo</th>
              <th className={`${TH} text-center`}>Total</th>
              <th className={`${TH} text-center`}>%</th>
              <th className={TH}>Distribuição</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <LinhaVazia colunas={4} carregando={carregando} mensagem="Nenhuma saída no período selecionado." />
            ) : (
              linhas.map((l) => (
                <tr key={l.motivo} className="hover:bg-paper/40">
                  <td className={`${TD} font-semibold text-ink`}>{l.motivo}</td>
                  <td className={`${TD} text-center font-display font-bold tabular-nums`}>{l.total}</td>
                  <td className={`${TD} text-center tabular-nums text-ink-soft`}>{pct(l.total, total)}</td>
                  <td className={TD}>
                    <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-pine-600"
                        style={{ width: pct(l.total, total) }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RodapeImpressao />
    </PainelRelatorio>
  );
}

/* ================================================================
   4) POR PESSOA (HISTÓRICO)
================================================================ */
function RelatorioPessoas({ usuarioNome }: PropsRelatorio) {
  const [busca, setBusca] = useState("");
  const { itens, carregando } = useSaidas({});

  const termo = busca.trim().toUpperCase();
  const filtrados = useMemo(() => {
    if (termo.length < 2) return [];
    return itens
      .filter(
        (s) =>
          s.nome.trim().toUpperCase().includes(termo) ||
          s.matricula.replace(/\s+/g, "").includes(termo.replace(/\s+/g, ""))
      )
      .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  }, [itens, termo]);

  function exportar() {
    baixarCSV(
      `historico-${termo.replace(/[^A-Z0-9]/gi, "-").toLowerCase()}.csv`,
      ["Data", "Hora", "Local", "Matrícula", "Nome", "Motivo", "Regime"],
      filtrados.map((s) => [formatarDataBR(s.data), s.hora, s.local, s.matricula, s.nome, s.motivo, s.regime])
    );
  }

  return (
    <PainelRelatorio>
      <CabecalhoRelatorio
        titulo="Histórico de Saídas por Pessoa"
        subtitulo={
          termo.length >= 2
            ? `${filtrados.length} saída(s) encontrada(s) para "${busca.trim()}"`
            : "Digite ao menos 2 caracteres do nome ou da matrícula"
        }
        usuarioNome={usuarioNome}
      />
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[260px] flex-1 print:hidden">
          <IconeBusca className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou matrícula (ex.: 629.896)…"
            className="h-10 w-full rounded-lg border border-line-strong bg-white/70 pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-pine-300"
            aria-label="Buscar pessoa"
          />
        </div>
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={filtrados.length === 0} />
      </div>
      <div className="overflow-x-auto">
        <table className={TBL}>
          <thead>
            <tr>
              <th className={TH}>Data</th>
              <th className={TH}>Hora</th>
              <th className={TH}>Local de destino</th>
              <th className={TH}>Matrícula</th>
              <th className={TH}>Nome</th>
              <th className={TH}>Motivo / Procedimento</th>
              <th className={`${TH} text-center`}>Regime</th>
            </tr>
          </thead>
          <tbody>
            {termo.length < 2 ? (
              <LinhaVazia colunas={7} carregando={carregando} mensagem="Digite um nome ou matrícula para ver o histórico." />
            ) : filtrados.length === 0 ? (
              <LinhaVazia colunas={7} carregando={carregando} mensagem={`Nenhuma saída encontrada para "${busca.trim()}".`} />
            ) : (
              filtrados.map((s) => (
                <tr key={s.id} className="hover:bg-paper/40">
                  <td className={`${TD} font-display font-bold tabular-nums text-ink`}>{formatarDataBR(s.data)}</td>
                  <td className={`${TD} font-display tabular-nums text-ink-soft`}>{s.hora}</td>
                  <td className={`${TD} font-medium text-ink`}>{s.local}</td>
                  <td className={`${TD} tabular-nums text-ink-soft`}>{s.matricula}</td>
                  <td className={`${TD} font-semibold text-ink`}>{s.nome}</td>
                  <td className={`${TD} text-ink-soft`}>{s.motivo || "—"}</td>
                  <td className={`${TD} text-center`}><TypeBadge tipo={s.regime} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RodapeImpressao />
    </PainelRelatorio>
  );
}

/* ================================================================
   5) POR OPERADOR
================================================================ */
function RelatorioOperadores({ usuarioNome }: PropsRelatorio) {
  const [de, setDe] = useState(primeiroDiaDoMesBR());
  const [ate, setAte] = useState(hojeBR());
  const { itens, carregando } = useSaidas({ de, ate });

  const linhas = useMemo(() => {
    const m = new Map<string, { nome: string; rs: string; total: number; ultima: string }>();
    for (const s of itens) {
      const chave = `${s.criadoPorNome}|${s.criadoPorRs}`;
      const atual = m.get(chave) ?? { nome: s.criadoPorNome, rs: s.criadoPorRs, total: 0, ultima: "" };
      atual.total += 1;
      const marca = `${s.data} ${s.hora}`;
      if (marca > atual.ultima) atual.ultima = marca;
      m.set(chave, atual);
    }
    return [...m.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
  }, [itens]);

  const total = itens.length;

  function exportar() {
    baixarCSV(
      `operadores-${dataBRParaISO(de)}-a-${dataBRParaISO(ate)}.csv`,
      ["Operador", "RS", "Total de cadastros", "%", "Último cadastro"],
      linhas.map((l) => [
        l.nome,
        l.rs,
        String(l.total),
        pct(l.total, total),
        l.ultima ? `${formatarDataBR(l.ultima.slice(0, 10))} ${l.ultima.slice(11)}` : "",
      ])
    );
  }

  return (
    <PainelRelatorio>
      <CabecalhoRelatorio
        titulo="Cadastros por Operador"
        subtitulo={`Período: ${formatarDataBR(de)} a ${formatarDataBR(ate)} · ${total} cadastro(s) no total`}
        usuarioNome={usuarioNome}
      />
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <SeletorPeriodo de={de} ate={ate} aoMudar={(d, a) => { setDe(d); setAte(a); }} />
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={linhas.length === 0} />
      </div>
      <div className="overflow-x-auto">
        <table className={TBL}>
          <thead>
            <tr>
              <th className={TH}>Operador</th>
              <th className={TH}>RS</th>
              <th className={`${TH} text-center`}>Total de cadastros</th>
              <th className={`${TH} text-center`}>%</th>
              <th className={TH}>Último cadastro</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <LinhaVazia colunas={5} carregando={carregando} mensagem="Nenhum cadastro no período selecionado." />
            ) : (
              linhas.map((l) => (
                <tr key={`${l.nome}|${l.rs}`} className="hover:bg-paper/40">
                  <td className={`${TD} font-semibold text-ink`}>{l.nome}</td>
                  <td className={`${TD} tabular-nums text-ink-soft`}>{l.rs}</td>
                  <td className={`${TD} text-center font-display font-bold tabular-nums`}>{l.total}</td>
                  <td className={`${TD} text-center tabular-nums text-ink-soft`}>{pct(l.total, total)}</td>
                  <td className={`${TD} font-display tabular-nums text-ink-soft`}>
                    {l.ultima ? `${formatarDataBR(l.ultima.slice(0, 10))} ${l.ultima.slice(11)}` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RodapeImpressao />
    </PainelRelatorio>
  );
}

/* ================================================================
   6) POR MOTORISTA
================================================================ */
function RelatorioMotoristas({ usuarioNome }: PropsRelatorio) {
  const [de, setDe] = useState(primeiroDiaDoMesBR());
  const [ate, setAte] = useState(hojeBR());
  const { itens, carregando } = useSaidas({ de, ate });

  const linhas = useMemo(() => {
    const m = new Map<string, { total: number; veiculos: Set<string>; naoRealizadas: number }>();
    for (const s of itens) {
      const mot = s.motorista?.trim();
      if (!mot) continue;
      const cur = m.get(mot) ?? { total: 0, veiculos: new Set<string>(), naoRealizadas: 0 };
      cur.total += 1;
      if (s.naoRealizada) cur.naoRealizadas += 1;
      if (s.veiculo?.trim()) cur.veiculos.add(s.veiculo.trim());
      m.set(mot, cur);
    }
    return [...m.entries()]
      .map(([motorista, v]) => ({
        motorista,
        total: v.total,
        naoRealizadas: v.naoRealizadas,
        veiculos: [...v.veiculos].sort(),
      }))
      .sort((a, b) => b.total - a.total || a.motorista.localeCompare(b.motorista));
  }, [itens]);

  const base = linhas.reduce((s, l) => s + l.total, 0);

  function exportar() {
    baixarCSV(
      `motoristas-${dataBRParaISO(de)}-a-${dataBRParaISO(ate)}.csv`,
      ["Motorista", "Total de saídas", "%", "Não realizadas", "Veículo(s) utilizado(s)"],
      linhas.map((l) => [
        l.motorista,
        String(l.total),
        pct(l.total, base),
        String(l.naoRealizadas),
        l.veiculos.join(", "),
      ])
    );
  }

  return (
    <PainelRelatorio>
      <CabecalhoRelatorio
        titulo="Saídas por Motorista"
        subtitulo={`Período: ${formatarDataBR(de)} a ${formatarDataBR(ate)} · ${base} saída(s) com motorista definido`}
        usuarioNome={usuarioNome}
      />
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <SeletorPeriodo de={de} ate={ate} aoMudar={(d, a) => { setDe(d); setAte(a); }} />
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={linhas.length === 0} />
      </div>
      <div className="overflow-x-auto">
        <table className={TBL}>
          <thead>
            <tr>
              <th className={TH}>Motorista</th>
              <th className={`${TH} text-center`}>Total</th>
              <th className={`${TH} text-center`}>%</th>
              <th className={`${TH} text-center`}>Não realizadas</th>
              <th className={TH}>Veículo(s) utilizado(s)</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <LinhaVazia colunas={5} carregando={carregando} mensagem="Nenhuma saída com motorista no período." />
            ) : (
              linhas.map((l) => (
                <tr key={l.motorista} className="hover:bg-paper/40">
                  <td className={`${TD} font-semibold text-ink`}>{l.motorista}</td>
                  <td className={`${TD} text-center font-display font-bold tabular-nums`}>{l.total}</td>
                  <td className={`${TD} text-center tabular-nums text-ink-soft`}>{pct(l.total, base)}</td>
                  <td className={`${TD} text-center tabular-nums ${l.naoRealizadas ? "font-bold text-cr-700" : "text-ink-mute"}`}>
                    {l.naoRealizadas}
                  </td>
                  <td className={`${TD} text-ink-soft`}>{l.veiculos.join(", ") || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RodapeImpressao />
    </PainelRelatorio>
  );
}

/* ================================================================
   7) POR VEÍCULO
================================================================ */
function RelatorioVeiculos({ usuarioNome }: PropsRelatorio) {
  const [de, setDe] = useState(primeiroDiaDoMesBR());
  const [ate, setAte] = useState(hojeBR());
  const { itens, carregando } = useSaidas({ de, ate });

  const linhas = useMemo(() => {
    const m = new Map<string, { total: number; motoristas: Set<string>; naoRealizadas: number }>();
    for (const s of itens) {
      const veic = s.veiculo?.trim();
      if (!veic) continue;
      const cur = m.get(veic) ?? { total: 0, motoristas: new Set<string>(), naoRealizadas: 0 };
      cur.total += 1;
      if (s.naoRealizada) cur.naoRealizadas += 1;
      if (s.motorista?.trim()) cur.motoristas.add(s.motorista.trim());
      m.set(veic, cur);
    }
    return [...m.entries()]
      .map(([veiculo, v]) => ({
        veiculo,
        total: v.total,
        naoRealizadas: v.naoRealizadas,
        motoristas: [...v.motoristas].sort(),
      }))
      .sort((a, b) => b.total - a.total || a.veiculo.localeCompare(b.veiculo));
  }, [itens]);

  const base = linhas.reduce((s, l) => s + l.total, 0);

  function exportar() {
    baixarCSV(
      `veiculos-${dataBRParaISO(de)}-a-${dataBRParaISO(ate)}.csv`,
      ["Veículo", "Total de saídas", "%", "Não realizadas", "Motorista(s)"],
      linhas.map((l) => [
        l.veiculo,
        String(l.total),
        pct(l.total, base),
        String(l.naoRealizadas),
        l.motoristas.join(", "),
      ])
    );
  }

  return (
    <PainelRelatorio>
      <CabecalhoRelatorio
        titulo="Utilização por Veículo"
        subtitulo={`Período: ${formatarDataBR(de)} a ${formatarDataBR(ate)} · ${base} saída(s) com veículo definido`}
        usuarioNome={usuarioNome}
      />
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <SeletorPeriodo de={de} ate={ate} aoMudar={(d, a) => { setDe(d); setAte(a); }} />
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={linhas.length === 0} />
      </div>
      <div className="overflow-x-auto">
        <table className={TBL}>
          <thead>
            <tr>
              <th className={TH}>Veículo</th>
              <th className={`${TH} text-center`}>Total</th>
              <th className={`${TH} text-center`}>%</th>
              <th className={`${TH} text-center`}>Não realizadas</th>
              <th className={TH}>Motorista(s)</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <LinhaVazia colunas={5} carregando={carregando} mensagem="Nenhuma saída com veículo no período." />
            ) : (
              linhas.map((l) => (
                <tr key={l.veiculo} className="hover:bg-paper/40">
                  <td className={`${TD} font-semibold text-ink`}>{l.veiculo}</td>
                  <td className={`${TD} text-center font-display font-bold tabular-nums`}>{l.total}</td>
                  <td className={`${TD} text-center tabular-nums text-ink-soft`}>{pct(l.total, base)}</td>
                  <td className={`${TD} text-center tabular-nums ${l.naoRealizadas ? "font-bold text-cr-700" : "text-ink-mute"}`}>
                    {l.naoRealizadas}
                  </td>
                  <td className={`${TD} text-ink-soft`}>{l.motoristas.join(", ") || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RodapeImpressao />
    </PainelRelatorio>
  );
}

/* ================================================================
   8) DE JUSTIFICATIVAS (saídas não realizadas)
================================================================ */
function RelatorioJustificativas({ usuarioNome }: PropsRelatorio) {
  const [de, setDe] = useState(primeiroDiaDoMesBR());
  const [ate, setAte] = useState(hojeBR());
  const { itens, carregando } = useSaidas({ de, ate });

  const lista = useMemo(
    () =>
      itens
        .filter((s) => s.naoRealizada)
        .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora)),
    [itens]
  );

  const totalPeriodo = itens.length;
  const realizadas = totalPeriodo - lista.length;

  function exportar() {
    baixarCSV(
      `justificativas-${dataBRParaISO(de)}-a-${dataBRParaISO(ate)}.csv`,
      ["Data", "Hora", "Nome", "Matrícula", "Local", "Regime", "Justificativa"],
      lista.map((s) => [
        formatarDataBR(s.data),
        s.hora,
        s.nome,
        s.matricula,
        s.local,
        s.regime,
        s.justificativa,
      ])
    );
  }

  return (
    <PainelRelatorio>
      <CabecalhoRelatorio
        titulo="Relatório de Justificativas — Saídas Não Realizadas"
        subtitulo={`Período: ${formatarDataBR(de)} a ${formatarDataBR(ate)}`}
        usuarioNome={usuarioNome}
      />
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <SeletorPeriodo de={de} ate={ate} aoMudar={(d, a) => { setDe(d); setAte(a); }} />
        <BotoesRelatorio aoExportar={exportar} exportarDesabilitado={lista.length === 0} />
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Cartao rotulo="Saídas no período" valor={totalPeriodo} />
        <Cartao rotulo="Realizadas" valor={realizadas} tom="azul" />
        <Cartao
          rotulo="Não realizadas"
          valor={lista.length}
          tom="vermelho"
        />
      </div>

      <div className="overflow-x-auto">
        <table className={TBL}>
          <thead>
            <tr>
              <th className={TH}>Data</th>
              <th className={TH}>Hora</th>
              <th className={TH}>Nome</th>
              <th className={TH}>Local de destino</th>
              <th className={`${TH} text-center`}>Regime</th>
              <th className={TH}>Justificativa</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <LinhaVazia colunas={6} carregando={carregando} mensagem="Nenhuma saída não realizada no período." />
            ) : (
              lista.map((s) => (
                <tr key={s.id} className="bg-cr-100/30 hover:bg-cr-100/50">
                  <td className={`${TD} font-display font-bold tabular-nums text-ink`}>{formatarDataBR(s.data)}</td>
                  <td className={`${TD} font-display tabular-nums text-ink-soft`}>{s.hora}</td>
                  <td className={`${TD} font-semibold text-ink`}>{s.nome}</td>
                  <td className={`${TD} text-ink-soft`}>{s.local}</td>
                  <td className={`${TD} text-center`}><TypeBadge tipo={s.regime} /></td>
                  <td className={`${TD} font-medium text-cr-700`}>{s.justificativa || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RodapeImpressao />
    </PainelRelatorio>
  );
}

/* ================================================================
   MENU DE RELATÓRIOS (hub)
================================================================ */
export default function Relatorios({ usuarioNome }: { usuarioNome: string }) {
  const [tipo, setTipo] = useState<TipoRelatorio>("diario");

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* Lista de relatórios */}
      <aside className="h-fit rounded-xl border border-line bg-surface p-2 shadow-sm print:hidden">
        <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
          Relatórios disponíveis
        </p>
        <div className="space-y-1">
          {OPCOES.map((o) => {
            const ativo = tipo === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setTipo(o.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                  ativo
                    ? "bg-pine-100/70 text-pine-800 ring-1 ring-pine-200"
                    : "text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                <o.Icone className="mt-0.5 size-5 shrink-0" />
                <span>
                  <span className={`block text-sm font-bold ${ativo ? "text-pine-800" : ""}`}>
                    {o.label}
                  </span>
                  <span className="block text-[11px] leading-snug text-ink-mute">{o.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Relatório selecionado */}
      <div>
        {tipo === "diario" && <RelatorioDiario usuarioNome={usuarioNome} />}
        {tipo === "periodo" && <RelatorioPeriodo usuarioNome={usuarioNome} />}
        {tipo === "locais" && <RelatorioLocais usuarioNome={usuarioNome} />}
        {tipo === "procedimentos" && <RelatorioProcedimentos usuarioNome={usuarioNome} />}
        {tipo === "pessoas" && <RelatorioPessoas usuarioNome={usuarioNome} />}
        {tipo === "operadores" && <RelatorioOperadores usuarioNome={usuarioNome} />}
        {tipo === "motoristas" && <RelatorioMotoristas usuarioNome={usuarioNome} />}
        {tipo === "veiculos" && <RelatorioVeiculos usuarioNome={usuarioNome} />}
        {tipo === "justificativas" && <RelatorioJustificativas usuarioNome={usuarioNome} />}
      </div>
    </div>
  );
}
