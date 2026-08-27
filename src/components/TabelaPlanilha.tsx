"use client";

import type { Saida } from "@/db/schema";
import { formatarDataBR } from "@/lib/format";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import Brasao from "./Brasao";

/**
 * Réplica em tela/impressão da planilha física de controle de saídas.
 *
 * Colunas do formulário impresso: Nº · DATA · HORA · LOCAL · MOTIVO/
 * PROCEDIMENTO · REGIME · OBSERVAÇÕES — matrícula e nome do servidor NÃO
 * aparecem na folha (ficam disponíveis apenas no CSV exportado).
 * Cabeçalho em amarelo (cor da planilha física), grade com bordas pretas
 * e espaço para assinatura no rodapé.
 */

/* ---------------- linhas da planilha ---------------- */

export interface LinhaPlanilhaVisual {
  numero: number;
  data: string; // DD/MM/AAAA
  hora: string; // HH:MM
  local: string;
  matricula: string; // fora da folha impressa — mantida para o CSV exportado
  nome: string; // fora da folha impressa — mantida para o CSV exportado
  motivo: string;
  regime: string; // SA | FE | CR
  obs: string; // situação + veículo/motorista, como na coluna de anotações
}

/** Converte registros de saída em linhas da planilha (ordem dia → hora). */
export function montarLinhasPlanilha(itens: Saida[]): LinhaPlanilhaVisual[] {
  const ordenadas = [...itens].sort(
    (a, b) =>
      `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`) || a.id - b.id
  );
  return ordenadas.map((s, i) => {
    const obs: string[] = [];
    if (s.naoRealizada) {
      obs.push(`NÃO REALIZADA${s.justificativa ? ` — ${s.justificativa}` : ""}`);
    }
    if (s.veiculo) obs.push(`VEÍC.: ${s.veiculo}`);
    if (s.motorista) obs.push(`MOTOR.: ${s.motorista}`);
    return {
      numero: i + 1,
      data: formatarDataBR(s.data),
      hora: s.hora,
      local: s.local,
      matricula: s.matricula,
      nome: s.nome,
      motivo: s.motivo || "—",
      regime: s.regime,
      obs: obs.join(" · "),
    };
  });
}

/* ---------------- estilos compartilhados ---------------- */

const COLUNAS = 7;

const TH =
  "border border-ink bg-hl-300 px-1.5 py-1.5 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wider text-ink sm:text-[10px]";
const TD = "break-words border border-ink px-1.5 py-1 align-top text-[10.5px] leading-snug sm:text-xs";
const TD_CENTRO = `${TD} text-center tabular-nums`;

/* ---------------- resumo por dia (quadro auxiliar) ---------------- */

export interface LinhaResumoDia {
  data: string; // DD/MM/AAAA
  total: number;
  sa: number;
  fe: number;
  cr: number;
}

function QuadroResumoDia({ resumo }: { resumo: LinhaResumoDia[] }) {
  const soma = resumo.reduce(
    (acc, d) => ({
      total: acc.total + d.total,
      sa: acc.sa + d.sa,
      fe: acc.fe + d.fe,
      cr: acc.cr + d.cr,
    }),
    { total: 0, sa: 0, fe: 0, cr: 0 }
  );
  const THQ =
    "border border-ink bg-hl-300 px-2 py-1 text-center text-[9px] font-extrabold uppercase tracking-wider text-ink sm:text-[10px]";
  const TDQ = "border border-ink px-2 py-1 text-center tabular-nums text-[10.5px] sm:text-xs";
  return (
    <div className="px-3 pb-3 pt-4 sm:px-4">
      <p className="mb-1.5 text-center text-[10px] font-extrabold uppercase tracking-[0.18em] sm:text-[11px]">
        Quadro-resumo por dia
      </p>
      <div className="overflow-x-auto">
        <table className="mx-auto w-full max-w-2xl border-collapse">
          <thead>
            <tr>
              <th className={THQ}>Data</th>
              <th className={THQ}>Saídas</th>
              <th className={THQ}>SA</th>
              <th className={THQ}>FE</th>
              <th className={THQ}>CR</th>
            </tr>
          </thead>
          <tbody>
            {resumo.map((d) => (
              <tr key={d.data} className="linha-planilha">
                <td className={`${TDQ} font-semibold`}>{d.data}</td>
                <td className={TDQ}>{d.total}</td>
                <td className={TDQ}>{d.sa}</td>
                <td className={TDQ}>{d.fe}</td>
                <td className={TDQ}>{d.cr}</td>
              </tr>
            ))}
            <tr className="linha-planilha bg-hl-100 font-extrabold">
              <td className={`${TDQ} text-right uppercase tracking-wider`}>Total</td>
              <td className={TDQ}>{soma.total}</td>
              <td className={TDQ}>{soma.sa}</td>
              <td className={TDQ}>{soma.fe}</td>
              <td className={TDQ}>{soma.cr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- componente principal ---------------- */

interface PropsTabelaPlanilha {
  /** Título central do carimbo (padrão: PLANILHA DE CONTROLE DE SAÍDAS). */
  titulo?: string;
  /** Linha de contexto sob o título, ex.: "Movimento do dia 25/08/2026". */
  contexto?: string;
  linhas: LinhaPlanilhaVisual[];
  /** Mantém linhas em branco no fim, como no formulário de papel. */
  minimoLinhas?: number;
  /** Rótulo da faixa de fechamento. */
  rotuloTotais?: string;
  /** Totais por regime; se omitido, são contados a partir das linhas. */
  totais?: { SA: number; FE: number; CR: number };
  /** Quadro auxiliar abaixo da planilha (usado no consolidado). */
  resumoPorDia?: LinhaResumoDia[];
  carregando?: boolean;
  usuarioNome: string;
  /** Hora da última sincronização, exibida pequena no topo (opcional). */
  atualizadoAs?: string | null;
}

export default function TabelaPlanilha({
  titulo = "Planilha de Controle de Saídas",
  contexto,
  linhas,
  minimoLinhas = 0,
  rotuloTotais = "Total de saídas",
  totais,
  resumoPorDia,
  carregando = false,
  usuarioNome,
  atualizadoAs,
}: PropsTabelaPlanilha) {
  const contagem =
    totais ??
    linhas.reduce(
      (acc, l) => {
        if (l.regime === "SA" || l.regime === "FE" || l.regime === "CR") {
          acc[l.regime] += 1;
        }
        return acc;
      },
      { SA: 0, FE: 0, CR: 0 }
    );

  const linhasVazias = Math.max(0, minimoLinhas - linhas.length);

  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-sm sm:p-5 print:border-none print:bg-transparent print:p-0 print:shadow-none">
      <div className="area-planilha overflow-hidden rounded-md border-2 border-ink bg-white text-ink">
        {/* Cabeçalho do formulário — igual ao alto da folha */}
        <div className="border-b-2 border-ink px-3 pb-2 pt-3 sm:px-5">
          <div className="flex items-center justify-center gap-4 text-center">
            <Brasao className="size-14 shrink-0 sm:size-16" />
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase leading-tight tracking-[0.2em] sm:text-[10px]">
                Polícia Penal — Estado de São Paulo
              </p>
              <p className="text-[10px] font-extrabold uppercase leading-snug tracking-wide sm:text-xs">
                {NOME_UNIDADE} · {SETOR_RESPONSAVEL}
              </p>
              <h2 className="mt-0.5 font-display text-sm font-extrabold uppercase leading-tight tracking-wide underline decoration-2 underline-offset-4 sm:text-lg">
                {titulo}
              </h2>
              {contexto ? (
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider sm:text-[11px]">
                  {contexto}
                </p>
              ) : null}
            </div>
            <Brasao className="hidden size-14 shrink-0 opacity-0 sm:block" />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 border-t border-ink/40 pt-1.5 text-[9px] uppercase tracking-wider text-ink-soft sm:text-[10px]">
            <span>
              Emitido por: <b className="text-ink">{usuarioNome}</b>
            </span>
            <span>{atualizadoAs ? `Atualizado às ${atualizadoAs}` : "Documento gerado eletronicamente"}</span>
          </div>
        </div>

        {/* Grade da planilha */}
        <div className="overflow-x-auto px-2 pt-2 sm:px-3">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${TH} w-9`}>Nº</th>
                <th className={`${TH} w-20`}>Data</th>
                <th className={`${TH} w-16`}>Hora</th>
                <th className={TH}>Local de destino</th>
                <th className={TH}>Motivo / Procedimento</th>
                <th className={`${TH} w-16`}>Regime</th>
                <th className={`${TH} w-32`}>Observações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr className="linha-planilha">
                  <td
                    colSpan={COLUNAS}
                    className="border border-ink px-3 py-6 text-center text-xs font-semibold uppercase tracking-wider text-ink-soft"
                  >
                    Carregando dados da planilha…
                  </td>
                </tr>
              ) : linhas.length === 0 ? (
                <tr className="linha-planilha">
                  <td
                    colSpan={COLUNAS}
                    className="border border-ink px-3 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft"
                  >
                    Nenhuma saída registrada nesta data / período
                  </td>
                </tr>
              ) : (
                linhas.map((l) => (
                  <tr
                    key={l.numero}
                    className="linha-planilha transition-colors hover:bg-hl-100/60 print:hover:bg-transparent"
                  >
                    <td className={`${TD_CENTRO} text-ink-soft`}>{l.numero}</td>
                    <td className={`${TD_CENTRO} font-semibold`}>{l.data}</td>
                    <td className={`${TD_CENTRO} font-display font-bold`}>{l.hora}</td>
                    <td className={`${TD} font-semibold`}>{l.local}</td>
                    <td className={TD}>{l.motivo}</td>
                    <td className={`${TD_CENTRO} text-xs font-extrabold`}>{l.regime}</td>
                    <td className={`${TD} text-[10px] text-ink-soft`}>{l.obs || "—"}</td>
                  </tr>
                ))
              )}

              {/* linhas em branco remanescentes, como na folha impressa */}
              {!carregando &&
                Array.from({ length: linhasVazias }).map((_, i) => (
                  <tr key={`vazia-${i}`} className="linha-planilha">
                    {Array.from({ length: COLUNAS }).map((__, j) => (
                      <td key={j} className="border border-ink px-1.5 py-1.5">
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}

              {/* faixa de fechamento com totais */}
              {!carregando && linhas.length > 0 && (
                <tr className="linha-planilha bg-hl-100 font-extrabold">
                  <td
                    colSpan={COLUNAS - 2}
                    className="border border-ink px-2 py-1.5 text-right text-[10px] uppercase tracking-wider sm:text-[11px]"
                  >
                    {rotuloTotais}
                  </td>
                  <td className="border border-ink px-1.5 py-1.5 text-center font-display text-xs tabular-nums">
                    {linhas.length}
                  </td>
                  <td className="border border-ink px-1.5 py-1.5 text-center text-[9.5px] uppercase tracking-wide sm:text-[10px]">
                    SA: {contagem.SA} · FE: {contagem.FE} · CR: {contagem.CR}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* quadro-resumo por dia (consolidado) */}
        {resumoPorDia && resumoPorDia.length > 0 ? (
          <QuadroResumoDia resumo={resumoPorDia} />
        ) : null}

        {/* assinaturas — como na folha física */}
        <div className="grid grid-cols-1 gap-8 px-3 pb-3 pt-8 text-center sm:grid-cols-2 sm:px-6 sm:pt-10">
          <div className="mx-auto w-full max-w-xs">
            <div className="border-t border-ink pt-1 text-[8.5px] font-bold uppercase tracking-wider sm:text-[9px]">
              Emitido por — {usuarioNome}
            </div>
          </div>
          <div className="mx-auto w-full max-w-xs">
            <div className="border-t border-ink pt-1 text-[8.5px] font-bold uppercase tracking-wider sm:text-[9px]">
              Validação — Direção do Estabelecimento
            </div>
          </div>
        </div>
        <p className="border-t border-ink/30 px-3 py-1.5 text-center text-[8px] uppercase tracking-[0.2em] text-ink-mute sm:text-[9px]">
          {NOME_UNIDADE} · {SETOR_RESPONSAVEL} — Sistema de Controle de Saídas
        </p>
      </div>
    </div>
  );
}
