"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Saida } from "@/db/schema";
import {
  LOCAIS_BASE,
  MAX_JUSTIFICATIVA,
  MAX_REGIME_OUTRO,
  MOTIVOS_BASE,
  TIPOS,
  horaAtualHHMM,
  normalizarHora,
  validarSaida,
  type DadosSaida,
} from "@/lib/constantes";
import { dataBRParaISO, formatarDataBR, hojeBR, hojeISO } from "@/lib/format";
import CampoDataBR from "./CampoDataBR";
import { IconeX } from "./Icons";

interface Props {
  editando: Saida | null;
  locais: string[];
  /** Somente administradores veem/editam veículo e motorista. */
  ehAdmin: boolean;
  aoFechar: () => void;
  /** Retorna true se o salvamento foi concluído com sucesso. */
  aoSalvar: (dados: DadosSaida, id?: number) => Promise<boolean>;
}

type Erros = Record<string, string>;

/** Estado inicial do formulário (novo cadastro ou edição). */
function estadoInicial(editando: Saida | null): DadosSaida {
  if (editando) {
    return {
      data: formatarDataBR(editando.data),
      hora: editando.hora,
      local: editando.local,
      matricula: editando.matricula,
      nome: editando.nome,
      motivo: editando.motivo,
      regime: editando.regime,
      regimeOutro: editando.regimeOutro ?? "",
      veiculo: editando.veiculo ?? "",
      motorista: editando.motorista ?? "",
      horarioPrevisto: editando.horarioPrevisto ?? "",
      naoRealizada: editando.naoRealizada ?? false,
      justificativa: editando.justificativa ?? "",
    };
  }
  return {
    data: hojeBR(),
    hora: horaAtualHHMM(),
    local: "",
    matricula: "",
    nome: "",
    motivo: "",
    regime: "FE",
    regimeOutro: "",
    veiculo: "",
    motorista: "",
    horarioPrevisto: "",
    naoRealizada: false,
    justificativa: "",
  };
}

export default function SaidaModal({ editando, locais, ehAdmin, aoFechar, aoSalvar }: Props) {
  const [form, setForm] = useState<DadosSaida>(() => estadoInicial(editando));
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const primeiroCampo = useRef<HTMLInputElement>(null);

  // Fecha com a tecla Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aoFechar]);

  // Foco inicial no primeiro campo.
  useEffect(() => {
    const t = window.setTimeout(() => primeiroCampo.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, []);

  const locaisUnidos = useMemo(
    () => Array.from(new Set([...locais, ...LOCAIS_BASE])).sort(),
    [locais]
  );

  function mudar(campo: keyof DadosSaida, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => {
      if (!e[campo]) return e;
      const copia = { ...e };
      delete copia[campo];
      return copia;
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const dadosNorm: DadosSaida = {
      ...form,
      data: dataBRParaISO(form.data),
      hora: normalizarHora(form.hora),
      local: form.local.trim(),
      nome: form.nome.trim(),
      motivo: form.motivo.trim(),
    };
    const { erros: validas } = validarSaida(dadosNorm);
    if (validas) {
      setErros(validas);
      setErroGeral("");
      return;
    }
    setSalvando(true);
    setErroGeral("");
    const ok = await aoSalvar(dadosNorm, editando?.id);
    setSalvando(false);
    if (!ok) setErroGeral("Não foi possível salvar. Verifique os campos e tente novamente.");
  }

  const clsErro = "border-red-400 focus:ring-red-300";
  const clsOk = "border-line-strong focus:ring-pine-300";

  const horaMinima = dataBRParaISO(form.data) === hojeISO() ? horaAtualHHMM() : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={aoFechar}
      role="dialog"
      aria-modal="true"
      aria-label={editando ? "Editar saída" : "Nova saída"}
    >
      <div
        className="animate-subir w-full max-w-xl rounded-t-2xl bg-surface shadow-2xl sm:rounded-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              {editando ? "Editar saída" : "Nova saída"}
            </h2>
            <p className="text-xs text-ink-mute">
              Preencha os campos conforme a planilha de referência.
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

        <form onSubmit={enviar} noValidate className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-data" className="mb-1 block text-xs font-semibold text-ink-soft">
                Data <span className="text-cr-700">*</span>
              </label>
              <CampoDataBR
                id="f-data"
                ref={primeiroCampo}
                value={form.data}
                onChange={(valor) => mudar("data", valor)}
                invalida={Boolean(erros.data)}
                required
                ariaLabel="Data da saída no formato DD/MM/AAAA"
                className={`w-full rounded-lg border bg-white/70 px-3 py-2 font-display tabular-nums text-sm outline-none ring-0 transition-shadow focus:ring-2 ${
                  erros.data ? clsErro : clsOk
                }`}
              />
              {erros.data && <p className="mt-1 text-xs text-red-600">{erros.data}</p>}
            </div>
            <div>
              <label htmlFor="f-hora" className="mb-1 block text-xs font-semibold text-ink-soft">
                Hora <span className="text-cr-700">*</span>
              </label>
              <input
                id="f-hora"
                type="time"
                min={horaMinima}
                value={form.hora}
                onChange={(e) => mudar("hora", e.target.value)}
                className={`w-full rounded-lg border bg-white/70 px-3 py-2 font-display tabular-nums text-sm outline-none focus:ring-2 ${
                  erros.hora ? clsErro : clsOk
                }`}
              />
              {erros.hora && <p className="mt-1 text-xs text-red-600">{erros.hora}</p>}
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="f-local" className="mb-1 block text-xs font-semibold text-ink-soft">
              Local de destino <span className="text-cr-700">*</span>
            </label>
            <input
              id="f-local"
              type="text"
              list="lista-locais"
              value={form.local}
              onChange={(e) => mudar("local", e.target.value.toUpperCase())}
              placeholder="Ex.: HCI MARIO COVAS"
              className={`w-full rounded-lg border bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 ${
                erros.local ? clsErro : clsOk
              }`}
            />
            <datalist id="lista-locais">
              {locaisUnidos.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            {erros.local && <p className="mt-1 text-xs text-red-600">{erros.local}</p>}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-matricula" className="mb-1 block text-xs font-semibold text-ink-soft">
                Matrícula <span className="text-cr-700">*</span>
              </label>
              <input
                id="f-matricula"
                type="text"
                value={form.matricula}
                onChange={(e) => mudar("matricula", e.target.value)}
                placeholder="Ex.: 1.234.567-8"
                className={`w-full rounded-lg border bg-white/70 px-3 py-2 tabular-nums text-sm outline-none focus:ring-2 ${
                  erros.matricula ? clsErro : clsOk
                }`}
              />
              {erros.matricula && <p className="mt-1 text-xs text-red-600">{erros.matricula}</p>}
            </div>
            <div>
              <label htmlFor="f-nome" className="mb-1 block text-xs font-semibold text-ink-soft">
                Nome <span className="text-cr-700">*</span>
              </label>
              <input
                id="f-nome"
                type="text"
                value={form.nome}
                onChange={(e) => mudar("nome", e.target.value.toUpperCase())}
                placeholder="NOME COMPLETO"
                className={`w-full rounded-lg border bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 ${
                  erros.nome ? clsErro : clsOk
                }`}
              />
              {erros.nome && <p className="mt-1 text-xs text-red-600">{erros.nome}</p>}
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="f-motivo" className="mb-1 block text-xs font-semibold text-ink-soft">
              Motivo / Procedimento
            </label>
            <input
              id="f-motivo"
              type="text"
              list="lista-motivos"
              value={form.motivo}
              onChange={(e) => mudar("motivo", e.target.value.toUpperCase())}
              placeholder="Ex.: RAIO X, ORTOPEDIA GESSO + RX, PERÍCIA"
              className={`w-full rounded-lg border bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 ${clsOk}`}
            />
            <datalist id="lista-motivos">
              {MOTIVOS_BASE.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          {ehAdmin && (
            <div className="mt-3 rounded-xl border border-pine-200 bg-pine-50/50 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-pine-700">
                Logística do serviço · preenchimento exclusivo do administrador
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-veiculo" className="mb-1 block text-xs font-semibold text-ink-soft">
                    Veículo
                  </label>
                  <input
                    id="f-veiculo"
                    type="text"
                    value={form.veiculo ?? ""}
                    onChange={(e) => mudar("veiculo", e.target.value.toUpperCase())}
                    placeholder="Ex.: FIAT DUCATO · ABC1D23"
                    className={`w-full rounded-lg border bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 ${clsOk}`}
                  />
                </div>
                <div>
                  <label htmlFor="f-motorista" className="mb-1 block text-xs font-semibold text-ink-soft">
                    Motorista
                  </label>
                  <input
                    id="f-motorista"
                    type="text"
                    value={form.motorista ?? ""}
                    onChange={(e) => mudar("motorista", e.target.value.toUpperCase())}
                    placeholder="NOME DO MOTORISTA"
                    className={`w-full rounded-lg border bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 ${clsOk}`}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-horario-previsto" className="mb-1 block text-xs font-semibold text-ink-soft">
                    Horário previsto para saída
                  </label>
                  <input
                    id="f-horario-previsto"
                    type="time"
                    value={form.horarioPrevisto ?? ""}
                    onChange={(e) => mudar("horarioPrevisto", e.target.value)}
                    className={`w-full rounded-lg border bg-white/80 px-3 py-2 font-display tabular-nums text-sm outline-none focus:ring-2 ${clsOk}`}
                  />
                  <p className="mt-1 text-[11px] text-ink-mute">
                    Se vazio, usa a hora do cadastro nos relatórios.
                  </p>
                </div>
                <div />
              </div>
            </div>
          )}

          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold text-ink-soft">
              Regime <span className="text-cr-700">*</span>
              <span className="ml-1 font-normal text-ink-mute">(RSA, FE, CR ou OUTRO — conforme planilha)</span>
            </p>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Regime da saída">
              {TIPOS.map((t) => {
                const ativo = form.regime === t;
                const borda =
                  t === "RSA"
                    ? "border-sa-700 bg-sa-100/60 text-sa-700"
                    : t === "CR"
                      ? "border-cr-700 bg-cr-100/60 text-cr-700"
                      : t === "OUTRO"
                        ? "border-amber-600 bg-amber-100/60 text-amber-700"
                        : "border-stone-500 bg-stone-200/60 text-stone-700";
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    onClick={() => {
                      setForm((f) => ({ ...f, regime: t, regimeOutro: t === "OUTRO" ? f.regimeOutro : "" }));
                      setErros((e) => {
                        if (!e.regime) return e;
                        const copia = { ...e };
                        delete copia.regime;
                        delete copia.regimeOutro;
                        return copia;
                      });
                    }}
                    className={`rounded-lg border-2 px-3 py-2 font-display text-sm font-bold tracking-wider transition-all ${
                      ativo ? borda : "border-line text-ink-mute hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {erros.regime && <p className="mt-1 text-xs text-red-600">{erros.regime}</p>}

            {/* Campo de descrição quando OUTRO é selecionado */}
            {form.regime === "OUTRO" && (
              <div className="mt-3">
                <label htmlFor="f-regime-outro" className="mb-1 block text-xs font-semibold text-amber-700">
                  Especifique o que será feito <span className="text-cr-700">*</span>
                </label>
                <input
                  id="f-regime-outro"
                  type="text"
                  maxLength={MAX_REGIME_OUTRO}
                  value={form.regimeOutro ?? ""}
                  onChange={(e) => {
                    mudar("regimeOutro", e.target.value);
                  }}
                  placeholder="Descreva o que será feito (máx. 50 caracteres)"
                  className={`w-full rounded-lg border bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 ${
                    erros.regimeOutro ? clsErro : clsOk
                  }`}
                />
                <div className="mt-1 flex items-center justify-between">
                  {erros.regimeOutro ? (
                    <p className="text-xs text-red-600">{erros.regimeOutro}</p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-[11px] font-semibold tabular-nums ${
                      (form.regimeOutro ?? "").length >= MAX_REGIME_OUTRO
                        ? "text-cr-700"
                        : "text-ink-mute"
                    }`}
                  >
                    {(form.regimeOutro ?? "").length}/{MAX_REGIME_OUTRO}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Situação da saída: realizada ou não, com justificativa — exclusivo do administrador */}
          {ehAdmin && (
          <div
            className={`mt-3 rounded-xl border p-3 ${
              form.naoRealizada ? "border-cr-200 bg-cr-100/40" : "border-line bg-paper/40"
            }`}
          >
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink-soft">
              <input
                type="checkbox"
                checked={form.naoRealizada ?? false}
                onChange={(e) => {
                  const v = e.target.checked;
                  setForm((f) => ({ ...f, naoRealizada: v, justificativa: v ? f.justificativa : "" }));
                  setErros((er) => {
                    if (!er.justificativa) return er;
                    const copia = { ...er };
                    delete copia.justificativa;
                    return copia;
                  });
                }}
                className="size-4 accent-cr-700"
              />
              Saída não realizada
            </label>
            {(form.naoRealizada ?? false) && (
              <div className="mt-2.5">
                <label htmlFor="f-justificativa" className="mb-1 block text-xs font-semibold text-cr-700">
                  Justificativa / motivo da não realização <span className="text-cr-700">*</span>
                </label>
                <input
                  id="f-justificativa"
                  type="text"
                  maxLength={MAX_JUSTIFICATIVA}
                  value={form.justificativa ?? ""}
                  onChange={(e) => mudar("justificativa", e.target.value)}
                  placeholder="Ex.: Internado não compareceu ao pátio"
                  className={`w-full rounded-lg border bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 ${
                    erros.justificativa ? clsErro : clsOk
                  }`}
                />
                <div className="mt-1 flex items-center justify-between">
                  {erros.justificativa ? (
                    <p className="text-xs text-red-600">{erros.justificativa}</p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-[11px] font-semibold tabular-nums ${
                      (form.justificativa ?? "").length >= MAX_JUSTIFICATIVA
                        ? "text-cr-700"
                        : "text-ink-mute"
                    }`}
                  >
                    {(form.justificativa ?? "").length}/{MAX_JUSTIFICATIVA}
                  </span>
                </div>
              </div>
            )}
          </div>
          )}

          {erroGeral && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erroGeral}
            </div>
          )}

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-line/50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 rounded-lg bg-pine-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800 disabled:opacity-60"
            >
              {salvando ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <span className="size-1.5 rounded-full bg-hl-300" />
              )}
              {editando ? "Salvar alterações" : "Cadastrar saída"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
