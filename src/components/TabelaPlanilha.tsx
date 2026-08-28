"use client";

import { Fragment, useMemo } from "react";
import type { Saida } from "@/db/schema";
import { formatarDataBR } from "@/lib/format";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import Brasao from "./Brasao";

/**
 * Réplica em tela/impressão da planilha física de controle de saídas.
 *
 * REGRAS DO DOCUMENTO (usado pelo Relatório Diário e pelo Consolidado por
 * Período — qualquer alteração aqui vale para os dois):
 *
 * 1. Oito colunas, nesta ordem, **sem** coluna "Nº":
 *    DATA DA SAÍDA · HORÁRIO PREVISTO PARA SAÍDA · LOCAL DA APRESENTAÇÃO ·
 *    QUANT. PPL · TIPO DE APRESENTAÇÃO · REGIME · VIATURA · MOTORISTA.
 *    A matrícula e o nome do servidor não aparecem na folha (ficam apenas no
 *    CSV exportado). Cabeçalho em amarelo (cor da planilha física), grade com
 *    bordas pretas e espaço para assinatura no rodapé.
 *
 * 2. Agrupamento: cada registro de `saidas` é **1 PPL**. Registros com a
 *    mesma combinação data + hora + local + tipo + regime + viatura +
 *    motorista + (não realizada/justificativa) formam um único bloco, e a
 *    coluna QUANT. PPL traz o número de registros do bloco. A comparação é
 *    feita com os textos normalizados (trim, espaços colapsados, maiúsculas
 *    — ver `normalizar`). Ordem: data → hora → local → tipo de apresentação.
 *    Exceção: blocos de automação (nome "AUTOMAÇÃO") ou de serviço rotineiro
 *    (transporte de alimentação / retirada do lixo, incluída a viagem combinada
 *    "TRANSPORTE DE ALIMENTAÇÃO E RETIRADA DO LIXO") não são PPL —
 *    as colunas QUANT. PPL, TIPO DE APRESENTAÇÃO e REGIME exibem "—" (o
 *    mesmo vale para o CSV); o horário previsto continua como nos horários
 *    rotineiros. O reconhecimento desses nomes/locais ignora acentos (ver
 *    `semAcentos`) e, nos locais, usa palavras-chave (ver `eLocalRotineiro`),
 *    para tolerar cadastros gravados sem acento.
 *
 * 3. Mesclagem hierárquica com `rowSpan` (a célula só é escrita na primeira
 *    linha do bloco): DATA = todas as linhas do mesmo dia; HORÁRIO = dia +
 *    horário; LOCAL = dia + horário + local; QUANT. PPL, TIPO DE APRESENTAÇÃO
 *    e REGIME nunca são mesclados (uma linha por grupo); VIATURA e MOTORISTA
 *    mesclam sequências consecutivas de valor igual dentro do mesmo
 *    dia + horário.
 *
 * 4. Separador de dias: entre um dia e outro entra uma faixa cinza ocupando
 *    as 8 colunas (`className="h-2 border border-ink bg-stone-300 p-0"`).
 *
 * 5. Saídas não realizadas: o texto do tipo de apresentação vai riscado
 *    (line-through) e ao lado, em vermelho e minúsculas,
 *    "não realizada — {justificativa}". Não se escreve mais "NÃO REALIZADA"
 *    dentro do motivo.
 *
 * 6. Totais: o rodapé soma **PPL** (total de registros), e não o número de
 *    linhas agrupadas. As linhas em branco de `minimoLinhas` contam sobre as
 *    linhas já agrupadas.
 *
 * 7. CSV: uma linha por PPL, com matrícula e nome, e o Quant. PPL do bloco a
 *    que a pessoa pertence — ver `montarCsvPlanilha` /
 *    `CABECALHO_CSV_PLANILHA` (usados pelos dois relatórios).
 */

/* ---------------- agrupamento (1 registro = 1 PPL) ---------------- */

const SEP = "\u0001";

/** Normaliza texto para comparação: trim, espaços colapsados, maiúsculas. */
function normalizar(valor: string | null | undefined): string {
  return (valor ?? "").trim().replace(/\s+/g, " ").toUpperCase();
}

/** Remove acentos/diacríticos para comparação (ex.: "ALIMENTAÇÃO" ≡ "ALIMENTACAO"). */
function semAcentos(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Palavras-chave de locais de serviço rotineiro (comparadas sem acento): não são apresentação de PPL. */
const CHAVES_LOCAL_ROTINEIRO = ["ALIMENTACAO", "LIXO"];

/**
 * Local de serviço rotineiro: transporte de alimentação, retirada do lixo ou a
 * viagem combinada ("TRANSPORTE DE ALIMENTAÇÃO E RETIRADA DO LIXO"),
 * reconhecidos por palavra-chave. O texto já deve estar normalizado e sem
 * acentos (ver `semAcentos`), para tolerar cadastros gravados sem acento.
 */
function eLocalRotineiro(local: string): boolean {
  return CHAVES_LOCAL_ROTINEIRO.some((chave) => local.includes(chave));
}

/**
 * Blocos sem PPL: registros de automação (nome "AUTOMAÇÃO") não são pessoas, e
 * os serviços rotineiros (transporte de alimentação / retirada do lixo, incluída
 * a viagem combinada "TRANSPORTE DE ALIMENTAÇÃO E RETIRADA DO LIXO") não são
 * apresentação — não faz sentido contá-los como PPL nem descrevê-los como tal.
 * Nesses blocos as colunas QUANT. PPL, TIPO DE APRESENTAÇÃO e REGIME exibem
 * "—"; o horário previsto segue o comportamento dos horários rotineiros.
 * A comparação ignora acentos: cadastros gravados sem acento (ex.:
 * "TRANSPORTE DE ALIMENTACAO" / "AUTOMACAO") são reconhecidos do mesmo jeito.
 */
const eSemPpl = (s: Pick<Saida, "nome" | "local">): boolean =>
  semAcentos(normalizar(s.nome)) === "AUTOMACAO" ||
  eLocalRotineiro(semAcentos(normalizar(s.local)));

/** Situação da saída: realizada ou não realizada + justificativa. */
function situacaoDe(s: Pick<Saida, "naoRealizada" | "justificativa">): string {
  return s.naoRealizada ? `1${SEP}${normalizar(s.justificativa)}` : "0";
}

/** Chave de agrupamento do bloco (textos normalizados). */
function chaveGrupo(s: Saida): string {
  return [
    s.data, // YYYY-MM-DD
    s.hora, // HH:mm
    normalizar(s.horarioPrevisto),
    normalizar(s.local),
    normalizar(s.motivo),
    normalizar(s.regime),
    normalizar(s.veiculo),
    normalizar(s.motorista),
    situacaoDe(s),
  ].join(SEP);
}

/** Ordem exigida pela planilha: data → hora → horário previsto → local → tipo (motivo). */
function compararSaidas(a: Saida, b: Saida): number {
  return (
    a.data.localeCompare(b.data) ||
    a.hora.localeCompare(b.hora) ||
    normalizar(a.horarioPrevisto).localeCompare(normalizar(b.horarioPrevisto)) ||
    normalizar(a.local).localeCompare(normalizar(b.local)) ||
    normalizar(a.motivo).localeCompare(normalizar(b.motivo)) ||
    normalizar(a.regime).localeCompare(normalizar(b.regime)) ||
    normalizar(a.veiculo).localeCompare(normalizar(b.veiculo)) ||
    normalizar(a.motorista).localeCompare(normalizar(b.motorista)) ||
    situacaoDe(a).localeCompare(situacaoDe(b))
  );
}

/** Uma linha da planilha = um bloco de PPL idênticas. */
export interface LinhaPlanilhaVisual {
  /** chave do bloco + índice — usada como key do React */
  chave: string;
  data: string; // DD/MM/AAAA
  hora: string; // HH:MM
  /** horário previsto informado pelo admin; cai em `hora` se vazio */
  horarioPrevisto: string;
  local: string;
  /** número de PPL no bloco (cada registro de saída = 1 PPL) */
  quant: number;
  /**
   * bloco sem PPL: automação (nome "AUTOMAÇÃO") ou serviço rotineiro
   * (transporte de alimentação / retirada do lixo, incluída a viagem
   * combinada) — quant, tipo e regime exibem "—"
   */
  semPpl: boolean;
  tipo: string; // tipo de apresentação (motivo / procedimento)
  regime: string; // SA | FE | CR
  veiculo: string;
  motorista: string;
  naoRealizada: boolean;
  justificativa: string;
  /** matrícula e nome ficam fora da folha impressa — apenas no CSV */
  matricula: string;
  nome: string;
}

/** Converte registros de saída em linhas agrupadas da planilha. */
export function montarLinhasPlanilha(itens: Saida[]): LinhaPlanilhaVisual[] {
  const ordenadas = [...itens].sort(
    (a, b) => compararSaidas(a, b) || a.id - b.id
  );

  const linhas: LinhaPlanilhaVisual[] = [];
  let chaveAnterior: string | null = null;

  for (const s of ordenadas) {
    const chave = chaveGrupo(s);
    const anterior = linhas[linhas.length - 1];
    if (anterior && chaveAnterior === chave) {
      anterior.quant += 1; // mesma PPL de bloco: só aumenta a quantidade
      // Só mantém o traço se TODO o bloco for sem PPL (não são PPL).
      anterior.semPpl = anterior.semPpl && eSemPpl(s);
      continue;
    }
    chaveAnterior = chave;
    linhas.push({
      chave: `${chave}${SEP}${linhas.length}`,
      data: formatarDataBR(s.data),
      hora: s.hora,
      horarioPrevisto: s.horarioPrevisto ?? "",
      local: s.local,
      quant: 1,
      semPpl: eSemPpl(s),
      tipo: s.motivo.trim() ? s.motivo.trim() : "—",
      regime: s.regime,
      veiculo: s.veiculo ?? "",
      motorista: s.motorista ?? "",
      naoRealizada: s.naoRealizada,
      justificativa: s.justificativa.trim(),
      matricula: s.matricula,
      nome: s.nome,
    });
  }

  return linhas;
}

/** Cabeçalho do CSV dos relatórios em formato de planilha. */
export const CABECALHO_CSV_PLANILHA = [
  "Data da saída",
  "Horário previsto para saída",
  "Local da apresentação",
  "Quant. PPL",
  "Matrícula",
  "Nome",
  "Tipo de apresentação",
  "Regime",
  "Viatura",
  "Motorista",
];

/**
 * Linhas do CSV: uma por PPL (matrícula e nome inclusos), na mesma ordem da
 * folha, com o Quant. PPL do bloco ao qual a pessoa pertence.
 */
export function montarCsvPlanilha(itens: Saida[]): string[][] {
  const ordenadas = [...itens].sort(
    (a, b) => compararSaidas(a, b) || a.id - b.id
  );

  const quantidadePorBloco = new Map<string, number>();
  for (const s of ordenadas) {
    const chave = chaveGrupo(s);
    quantidadePorBloco.set(chave, (quantidadePorBloco.get(chave) ?? 0) + 1);
  }

  return ordenadas.map((s) => {
    // Automação / serviço rotineiro: não são PPL — traço no lugar da
    // contagem, do tipo de apresentação e do regime.
    const semPpl = eSemPpl(s);
    return [
      formatarDataBR(s.data),
      s.horarioPrevisto || s.hora,
      s.local,
      semPpl ? "—" : String(quantidadePorBloco.get(chaveGrupo(s)) ?? 1),
      s.matricula,
      s.nome,
      semPpl ? "—" : s.motivo.trim() ? s.motivo.trim() : "—",
      semPpl ? "—" : s.regime,
      s.veiculo ?? "",
      s.motorista ?? "",
    ];
  });
}

/* ---------------- estilos compartilhados ---------------- */

const COLUNAS = 8;

const TH =
  "border border-ink bg-hl-300 px-1.5 py-1.5 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wider text-ink sm:text-[10px]";
const TD =
  "break-words border border-ink px-1.5 py-1 align-middle text-center text-[10.5px] leading-snug sm:text-xs";
const TD_CENTRO = `${TD} tabular-nums`;
/** Célula mesclada (rowSpan): centrada no bloco que ela representa. */
const TD_MESCLADA = `${TD} font-semibold`;

/* ---------------- mesclagem hierárquica (rowSpan) ---------------- */

interface Celula {
  inicia: boolean;
  rowSpan: number;
}

interface LinhaLayout {
  linha: LinhaPlanilhaVisual;
  /** faixa cinza de separação antes desta linha (mudou o dia) */
  separadorAntes: boolean;
  dia: Celula;
  hora: Celula;
  local: Celula;
  veiculo: Celula;
  motorista: Celula;
}

/** Marca a primeira linha de cada bloco de chaves consecutivas iguais. */
function marcarBlocos(
  total: number,
  chave: (i: number) => string
): { inicia: boolean[]; rowSpan: number[] } {
  const inicia = Array.from({ length: total }, () => false);
  const rowSpan = Array.from({ length: total }, () => 0);
  let i = 0;
  while (i < total) {
    let j = i + 1;
    while (j < total && chave(j) === chave(i)) j += 1;
    inicia[i] = true;
    rowSpan[i] = j - i;
    i = j;
  }
  return { inicia, rowSpan };
}

const celula = (
  marca: { inicia: boolean[]; rowSpan: number[] },
  i: number
): Celula => ({ inicia: marca.inicia[i], rowSpan: marca.rowSpan[i] });

/** rowSpan só é necessário quando o bloco tem mais de uma linha. */
const rowSpanDe = (c: Celula): number | undefined => (c.rowSpan > 1 ? c.rowSpan : undefined);

/**
 * Calcula quais células aparecem em cada linha e com que rowSpan, seguindo a
 * hierarquia da folha: dia → horário → local; viatura/motorista mesclam por
 * sequência consecutiva de valor igual dentro do mesmo dia + horário.
 */
function montarLayout(linhas: LinhaPlanilhaVisual[]): LinhaLayout[] {
  const n = linhas.length;
  const chaveDia = (i: number) => linhas[i].data;
  const chaveHora = (i: number) => `${linhas[i].data}${SEP}${linhas[i].hora}${SEP}${linhas[i].horarioPrevisto}`;
  const chaveLocal = (i: number) =>
    `${chaveHora(i)}${SEP}${normalizar(linhas[i].local)}`;
  const chaveVeiculo = (i: number) => `${chaveHora(i)}${SEP}${normalizar(linhas[i].veiculo)}`;
  const chaveMotorista = (i: number) =>
    `${chaveHora(i)}${SEP}${normalizar(linhas[i].motorista)}`;

  const dia = marcarBlocos(n, chaveDia);
  const hora = marcarBlocos(n, chaveHora);
  const local = marcarBlocos(n, chaveLocal);
  const veiculo = marcarBlocos(n, chaveVeiculo);
  const motorista = marcarBlocos(n, chaveMotorista);

  return linhas.map((linha, i) => ({
    linha,
    separadorAntes: i > 0 && linhas[i - 1].data !== linha.data,
    dia: celula(dia, i),
    hora: celula(hora, i),
    local: celula(local, i),
    veiculo: celula(veiculo, i),
    motorista: celula(motorista, i),
  }));
}

/* ---------------- resumo por dia (quadro auxiliar) ---------------- */

export interface LinhaResumoDia {
  data: string; // DD/MM/AAAA
  total: number;
  rsa: number;
  fe: number;
  cr: number;
  outro: number;
}

function QuadroResumoDia({ resumo }: { resumo: LinhaResumoDia[] }) {
  const soma = resumo.reduce(
    (acc, d) => ({
      total: acc.total + d.total,
      rsa: acc.rsa + d.rsa,
      fe: acc.fe + d.fe,
      cr: acc.cr + d.cr,
      outro: acc.outro + d.outro,
    }),
    { total: 0, rsa: 0, fe: 0, cr: 0, outro: 0 }
  );
  const THQ =
    "border border-ink bg-hl-300 px-2 py-1 text-center text-[9px] font-extrabold uppercase tracking-wider text-ink sm:text-[10px]";
  const TDQ =
    "border border-ink px-2 py-1 text-center tabular-nums text-[10.5px] sm:text-xs";
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
              <th className={THQ}>PPL</th>
              <th className={THQ}>RSA</th>
              <th className={THQ}>FE</th>
              <th className={THQ}>CR</th>
              <th className={THQ}>OUTRO</th>
            </tr>
          </thead>
          <tbody>
            {resumo.map((d) => (
              <tr key={d.data} className="linha-planilha">
                <td className={`${TDQ} font-semibold`}>{d.data}</td>
                <td className={TDQ}>{d.total}</td>
                <td className={TDQ}>{d.rsa}</td>
                <td className={TDQ}>{d.fe}</td>
                <td className={TDQ}>{d.cr}</td>
                <td className={TDQ}>{d.outro}</td>
              </tr>
            ))}
            <tr className="linha-planilha bg-hl-100 font-extrabold">
              <td className={`${TDQ} text-right uppercase tracking-wider`}>Total</td>
              <td className={TDQ}>{soma.total}</td>
              <td className={TDQ}>{soma.rsa}</td>
              <td className={TDQ}>{soma.fe}</td>
              <td className={TDQ}>{soma.cr}</td>
              <td className={TDQ}>{soma.outro}</td>
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
  /** Linhas já agrupadas por montarLinhasPlanilha (1 linha = 1 bloco de PPL). */
  linhas: LinhaPlanilhaVisual[];
  /** Mantém linhas em branco no fim, como no formulário de papel. */
  minimoLinhas?: number;
  /** Rótulo da faixa de fechamento. */
  rotuloTotais?: string;
  /** Totais por regime em PPL; se omitido, somam-se as linhas agrupadas. */
  totais?: { RSA: number; FE: number; CR: number; OUTRO: number };
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
  const layout = useMemo(() => montarLayout(linhas), [linhas]);

  // Total de PPL = soma dos registros, não o número de linhas agrupadas.
  const totalPpl = linhas.reduce((acc, l) => acc + l.quant, 0);
  const contagem =
    totais ??
    linhas.reduce(
      (acc, l) => {
        if (l.regime === "RSA" || l.regime === "FE" || l.regime === "CR" || l.regime === "OUTRO") {
          acc[l.regime] += l.quant;
        }
        return acc;
      },
      { RSA: 0, FE: 0, CR: 0, OUTRO: 0 }
    );

  // As linhas em branco de sobra contam sobre as linhas já agrupadas.
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
            <span>
              {atualizadoAs
                ? `Atualizado às ${atualizadoAs}`
                : "Documento gerado eletronicamente"}
            </span>
          </div>
        </div>

        {/* Grade da planilha */}
        <div className="overflow-x-auto px-2 pt-2 sm:px-3">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${TH} w-20`}>Data da saída</th>
                <th className={`${TH} w-20`}>Horário previsto para saída</th>
                <th className={TH}>Local da apresentação</th>
                <th className={`${TH} w-12`}>Quant. PPL</th>
                <th className={TH}>Tipo de apresentação</th>
                <th className={`${TH} w-16`}>Regime</th>
                <th className={`${TH} w-24`}>Viatura</th>
                <th className={`${TH} w-28`}>Motorista</th>
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
                layout.map((celulas) => {
                  const l = celulas.linha;
                  const motivoNaoRealizado = (
                    <span className="text-[9.5px] font-bold lowercase text-cr-700 sm:text-[10px]">
                      {`não realizada${l.justificativa ? ` — ${l.justificativa}` : ""}`}
                    </span>
                  );
                  return (
                    <Fragment key={l.chave}>
                      {/* faixa cinza entre um dia e outro */}
                      {celulas.separadorAntes ? (
                        <tr>
                          <td
                            colSpan={COLUNAS}
                            className="h-2 border border-ink bg-stone-300 p-0"
                          />
                        </tr>
                      ) : null}
                      <tr className="linha-planilha transition-colors hover:bg-hl-100/60 print:hover:bg-transparent">
                        {celulas.dia.inicia ? (
                          <td
                            rowSpan={rowSpanDe(celulas.dia)}
                            className={`${TD_MESCLADA} text-center font-display text-xs font-bold sm:text-[13px]`}
                          >
                            {l.data}
                          </td>
                        ) : null}
                        {celulas.hora.inicia ? (
                          <td
                            rowSpan={rowSpanDe(celulas.hora)}
                            className={`${TD_MESCLADA} text-center font-display tabular-nums`}
                          >
                            {l.horarioPrevisto || l.hora}
                          </td>
                        ) : null}
                        {celulas.local.inicia ? (
                          <td
                            rowSpan={rowSpanDe(celulas.local)}
                            className={TD_MESCLADA}
                          >
                            {l.local}
                          </td>
                        ) : null}
                        <td
                          className={`${TD_CENTRO} font-display text-xs font-extrabold`}
                        >
                          {l.semPpl ? "—" : l.quant}
                        </td>
                        <td className={TD}>
                          {l.semPpl ? (
                            "—"
                          ) : l.naoRealizada ? (
                            <>
                              <span className="text-ink-soft line-through decoration-cr-700/70">
                                {l.tipo}
                              </span>
                              <span className="ml-1.5">{motivoNaoRealizado}</span>
                            </>
                          ) : (
                            l.tipo
                          )}
                        </td>
                        <td className={`${TD_CENTRO} text-xs font-extrabold`}>
                          {l.semPpl ? "—" : l.regime}
                        </td>
                        {celulas.veiculo.inicia ? (
                          <td
                            rowSpan={rowSpanDe(celulas.veiculo)}
                            className={TD_MESCLADA}
                          >
                            {l.veiculo || "—"}
                          </td>
                        ) : null}
                        {celulas.motorista.inicia ? (
                          <td
                            rowSpan={rowSpanDe(celulas.motorista)}
                            className={TD_MESCLADA}
                          >
                            {l.motorista || "—"}
                          </td>
                        ) : null}
                      </tr>
                    </Fragment>
                  );
                })
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

              {/* faixa de fechamento com totais em PPL */}
              {!carregando && linhas.length > 0 && (
                <tr className="linha-planilha bg-hl-100 font-extrabold">
                  <td
                    colSpan={COLUNAS - 2}
                    className="border border-ink px-2 py-1.5 text-right text-[10px] uppercase tracking-wider sm:text-[11px]"
                  >
                    {rotuloTotais}
                  </td>
                  <td className="border border-ink px-1.5 py-1.5 text-center font-display text-xs tabular-nums">
                    {totalPpl}
                  </td>
                  <td className="border border-ink px-1.5 py-1.5 text-center text-[9.5px] uppercase tracking-wide sm:text-[10px]">
                    RSA: {contagem.RSA} · FE: {contagem.FE} · CR: {contagem.CR} · OUTRO: {contagem.OUTRO}
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
