"use client";

import { useRef, useState } from "react";
import { parseArquivoPlanilha, type ResultadoParse } from "@/lib/planilha";
import { formatarDataBR } from "@/lib/format";
import { baixarCSV } from "./relatorios/comum";
import TypeBadge from "./TypeBadge";
import { IconeAlerta, IconeCheck, IconeDownload, IconeX } from "./Icons";

interface Props {
  aoFechar: () => void;
  aoConcluir: () => void;
  avisar: (tipo: "ok" | "erro", msg: string) => void;
}

export default function ImportarPlanilha({ aoFechar, aoConcluir, avisar }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [carregando, setCarregando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoParse | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [erroLeitura, setErroLeitura] = useState("");
  const [resumoFinal, setResumoFinal] = useState<{
    importadas: number;
    duplicadas: number;
    invalidas: number;
  } | null>(null);

  async function lerArquivo(file: File) {
    setErroLeitura("");
    setResultado(null);
    setResumoFinal(null);
    setNomeArquivo(file.name);
    setCarregando(true);
    try {
      const r = await parseArquivoPlanilha(file);
      if (!r.totalLidas) {
        setErroLeitura("A planilha está vazia ou não tem linhas de dados.");
      }
      setResultado(r);
    } catch {
      setErroLeitura("Não foi possível ler o arquivo. Use .xlsx, .xls ou .csv.");
    } finally {
      setCarregando(false);
    }
  }

  async function confirmar() {
    if (!resultado || !resultado.validas.length) return;
    setImportando(true);
    try {
      const r = await fetch("/api/saidas/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linhas: resultado.validas }),
      });
      const corpo = await r.json();
      if (!r.ok) throw new Error(corpo?.erro ?? "Falha na importação.");
      setResumoFinal({
        importadas: corpo.importadas ?? 0,
        duplicadas: corpo.duplicadas ?? 0,
        invalidas: corpo.invalidas ?? 0,
      });
      avisar(
        "ok",
        `Importação concluída: ${corpo.importadas} nova(s) saída(s).`
      );
      aoConcluir();
    } catch (e) {
      avisar("erro", e instanceof Error ? e.message : "Falha na importação.");
    } finally {
      setImportando(false);
    }
  }

  function baixarModelo() {
    baixarCSV(
      "modelo-importacao-saidas.csv",
      ["Data", "Hora", "Local", "Matrícula", "Nome", "Motivo", "Regime"],
      [
        ["28/07/2026", "07:00", "HCI MARIO COVAS", "629.896", "BRENO PITA DE MAGALHAES", "REUMATOLOGIA", "RSA"],
        ["28/07/2026", "14:00", "HOSPITAL MATERNO INFANTIL", "771.500-6", "CLEBER DOS SANTOS MARQUES", "RAIO X", "FE"],
      ]
    );
  }

  const previa = resultado ? resultado.linhas.slice(0, 8) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={aoFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Importar planilha de saídas"
    >
      <div
        className="animate-subir flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              Importar planilha de saídas
            </h2>
            <p className="text-xs text-ink-mute">
              Exclusivo do administrador · aceita .xlsx, .xls e .csv · datas passadas são permitidas
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-md p-1.5 text-ink-mute transition-colors hover:bg-line/60 hover:text-ink"
            aria-label="Fechar"
          >
            <IconeX className="size-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* seleção do arquivo */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={carregando || importando}
              className="inline-flex h-10 items-center gap-2 rounded-lg border-2 border-dashed border-line-strong bg-paper/50 px-4 text-sm font-semibold text-ink-soft transition-colors hover:border-pine-600 hover:text-pine-700 disabled:opacity-50"
            >
              <IconeDownload className="size-4 rotate-180" />
              {nomeArquivo ? "Trocar arquivo" : "Selecionar arquivo da planilha"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void lerArquivo(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={baixarModelo}
              className="text-xs font-semibold text-pine-700 underline-offset-2 hover:underline"
            >
              Baixar modelo de planilha
            </button>
            {nomeArquivo && (
              <span className="text-xs text-ink-mute">
                Arquivo: <b className="text-ink-soft">{nomeArquivo}</b>
              </span>
            )}
          </div>

          {carregando && (
            <p className="mt-4 text-sm text-ink-mute">Lendo planilha…</p>
          )}

          {erroLeitura && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <IconeAlerta className="mt-0.5 size-4 shrink-0" />
              {erroLeitura}
            </div>
          )}

          {/* resumo da leitura */}
          {resultado && !resumoFinal && (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-line bg-paper/50 p-3 text-center">
                  <p className="font-display text-2xl font-bold tabular-nums">{resultado.totalLidas}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">linhas lidas</p>
                </div>
                <div className="rounded-lg border border-pine-200 bg-pine-50 p-3 text-center">
                  <p className="font-display text-2xl font-bold tabular-nums text-pine-700">
                    {resultado.validas.length}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-pine-700">válidas</p>
                </div>
                <div className="rounded-lg border border-cr-100 bg-cr-100/40 p-3 text-center">
                  <p className="font-display text-2xl font-bold tabular-nums text-cr-700">
                    {resultado.problemas.length}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-cr-700">com problema</p>
                </div>
              </div>

              {/* pré-visualização */}
              <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                  <thead className="bg-paper/70 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                    <tr>
                      <th className="px-2 py-2">Linha</th>
                      <th className="px-2 py-2">Data</th>
                      <th className="px-2 py-2">Hora</th>
                      <th className="px-2 py-2">Local</th>
                      <th className="px-2 py-2">Matrícula</th>
                      <th className="px-2 py-2">Nome</th>
                      <th className="px-2 py-2 text-center">Regime</th>
                      <th className="px-2 py-2">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previa.map((l) => (
                      <tr key={l.linha} className={`border-t border-line ${l.ok ? "" : "bg-cr-100/40"}`}>
                        <td className="px-2 py-1.5 tabular-nums text-ink-mute">{l.linha}</td>
                        <td className="px-2 py-1.5 tabular-nums">{l.data ? formatarDataBR(l.data) : "—"}</td>
                        <td className="px-2 py-1.5 tabular-nums">{l.hora || "—"}</td>
                        <td className="max-w-[140px] truncate px-2 py-1.5">{l.local || "—"}</td>
                        <td className="px-2 py-1.5 tabular-nums">{l.matricula || "—"}</td>
                        <td className="max-w-[140px] truncate px-2 py-1.5">{l.nome || "—"}</td>
                        <td className="px-2 py-1.5 text-center">
                          {l.regime ? <TypeBadge tipo={l.regime} /> : "—"}
                        </td>
                        <td className="px-2 py-1.5">
                          {l.ok ? (
                            <span className="inline-flex items-center gap-1 font-bold text-pine-700">
                              <IconeCheck className="size-3.5" /> ok
                            </span>
                          ) : (
                            <span className="text-cr-700">{l.erro}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {resultado.linhas.length > 8 && (
                <p className="mt-1 text-[11px] text-ink-mute">
                  Mostrando 8 de {resultado.linhas.length} linhas na pré-visualização.
                </p>
              )}

              {resultado.problemas.length > 0 && (
                <div className="mt-3 rounded-lg border border-cr-100 bg-cr-100/30 p-3 text-xs text-cr-700">
                  <p className="mb-1 font-bold">Linhas com problema (não serão importadas):</p>
                  <ul className="max-h-24 space-y-0.5 overflow-y-auto">
                    {resultado.problemas.slice(0, 12).map((p) => (
                      <li key={p.linha}>
                        Linha {p.linha}: {p.erro}
                      </li>
                    ))}
                    {resultado.problemas.length > 12 && (
                      <li>… e mais {resultado.problemas.length - 12} linha(s).</li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* resultado final */}
          {resumoFinal && (
            <div className="mt-4 rounded-xl border border-pine-200 bg-pine-50 p-4 text-sm text-pine-800">
              <p className="flex items-center gap-2 font-display text-base font-bold">
                <IconeCheck className="size-5" /> Importação concluída
              </p>
              <ul className="mt-2 space-y-1">
                <li>
                  <b>{resumoFinal.importadas}</b> saída(s) importada(s) com sucesso.
                </li>
                {resumoFinal.duplicadas > 0 && (
                  <li>
                    <b>{resumoFinal.duplicadas}</b> linha(s) ignorada(s) por já existirem no sistema.
                  </li>
                )}
                {resumoFinal.invalidas > 0 && (
                  <li>
                    <b>{resumoFinal.invalidas}</b> linha(s) inválida(s) descartada(s).
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-line/50"
          >
            {resumoFinal ? "Concluir" : "Cancelar"}
          </button>
          {!resumoFinal && (
            <button
              type="button"
              onClick={() => void confirmar()}
              disabled={!resultado || !resultado.validas.length || importando}
              className="inline-flex items-center gap-2 rounded-lg bg-pine-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800 disabled:opacity-50"
            >
              {importando ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <IconeCheck className="size-4" />
              )}
              {importando
                ? "Importando…"
                : `Importar ${resultado?.validas.length ?? 0} saída(s) válida(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
