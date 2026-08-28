export const TIPOS = ["RSA", "FE", "CR", "OUTRO"] as const;
export type Tipo = (typeof TIPOS)[number];

export function ehTipo(v: string): v is Tipo {
  return (TIPOS as readonly string[]).includes(v);
}

export const MAX_REGIME_OUTRO = 50;

/** Locais de destino mais comuns (sugestões no formulário). */
export const LOCAIS_BASE = [
  "IMEC SÃO PAULO",
  "HCI MARIO COVAS",
  "HCI - MARIO COVAS",
  "HC I MARIO COVAS",
  "HC I - MARIO COVAS",
  "HC.III - SÃO FRANCISCO",
  "H. SÃO FRANCISCO",
  "HOSPITAL MATERNO INFANTIL",
  "HOSPITAL ESTADUAL DE BAURU",
  "HC - RECEPÇÃO ENDOSCOPIA",
  "CAPS AD - RUA DR. JOAQUIM DE ABREU S. VIDAL - 319",
  "CHSP - VIA CDP BAURU",
].sort();

/** Procedimentos / motivos mais comuns (sugestões no formulário). */
export const MOTIVOS_BASE = [
  "BIÓPSIA DE PELE",
  "CIRURGIA GERAL",
  "ELETROCARDIOGRAMA",
  "EXTRAÇÃO CÂTETER DUPLO J",
  "GASTRO CIRURGIA",
  "INFECTO GERAL",
  "INFECTOLOGIA",
  "MEDIDA DE SEGURANÇA (TRATAMENTO AMBULATORIAL)",
  "NEUROLOGIA",
  "ORTOPEDIA GESSO",
  "ORTOPEDIA GESSO + RX",
  "OSSEOPLASTIA",
  "PERÍCIA",
  "POS-CIRURGIA",
  "RAIO X",
  "REUMATOLOGIA",
  "TRAUMA DE FACE",
  "UROLITOTRIPSIA",
  "UROLOGIA GERAL",
].sort();

export const MAX_JUSTIFICATIVA = 50;

export interface DadosSaida {
  data: string;
  hora: string;
  local: string;
  matricula: string;
  nome: string;
  motivo: string;
  regime: string;
  regimeOutro?: string;
  veiculo?: string;
  motorista?: string;
  horarioPrevisto?: string;
  naoRealizada?: boolean;
  justificativa?: string;
}

/** Data ISO de hoje (AAAA-MM-DD). */
export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Hora local atual (HH:MM). */
export function horaAtualHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Normaliza entradas de hora como "7:00" ou "0700" para "07:00". */
export function normalizarHora(raw: string): string {
  let h = raw.trim();
  if (/^\d:\d{2}$/.test(h)) h = `0${h}`;
  if (/^\d{3,4}$/.test(h)) {
    const limpa = h.padStart(4, "0");
    h = `${limpa.slice(0, 2)}:${limpa.slice(2)}`;
  }
  return h;
}

/** Verifica se a data/hora informada é anterior ao momento atual do relógio. */
export function ehDataHoraPassada(dataISO: string, horaHHMM: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO) || !/^\d{2}:\d{2}$/.test(horaHHMM)) {
    return false;
  }
  const hoje = hojeISO();
  const horaAgora = horaAtualHHMM();

  if (dataISO < hoje) return true;
  if (dataISO === hoje && horaHHMM < horaAgora) return true;
  return false;
}

/** Validação compartilhada entre API e formulário. */
export function validarSaida(
  input: DadosSaida | Record<string, unknown> | null | undefined
): { erros: Record<string, string> | null; dados: DadosSaida } {
  const erros: Record<string, string> = {};
  const data = String(input?.data ?? "").trim();
  const hora = normalizarHora(String(input?.hora ?? ""));
  const local = String(input?.local ?? "").trim().toUpperCase();
  const matricula = String(input?.matricula ?? "").trim();
  const nome = String(input?.nome ?? "").trim().toUpperCase();
  const motivo = String(input?.motivo ?? "").trim().toUpperCase();
  const regime = String(input?.regime ?? "").trim().toUpperCase();
  const veiculo = String(input?.veiculo ?? "").trim().toUpperCase();
  const motorista = String(input?.motorista ?? "").trim().toUpperCase();
  let horarioPrevisto = normalizarHora(String(input?.horarioPrevisto ?? "")).trim();
  if (horarioPrevisto && !/^\d{2}:\d{2}$/.test(horarioPrevisto)) {
    horarioPrevisto = "";
  }
  if (horarioPrevisto) {
    const [hh, mm] = horarioPrevisto.split(":").map(Number);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      horarioPrevisto = "";
    }
  }
  const naoRealizada = Boolean(input?.naoRealizada);
  let justificativa = String(input?.justificativa ?? "").trim();
  if (!naoRealizada) justificativa = "";
  if (justificativa.length > MAX_JUSTIFICATIVA) {
    erros.justificativa = `A justificativa deve ter no máximo ${MAX_JUSTIFICATIVA} caracteres.`;
  }
  if (naoRealizada && !justificativa) {
    erros.justificativa = "Informe a justificativa da saída não realizada.";
  }

  let regimeOutro = String(input?.regimeOutro ?? "").trim();
  if (regime !== "OUTRO") {
    regimeOutro = "";
  }
  if (regime === "OUTRO") {
    if (!regimeOutro) {
      erros.regimeOutro = "Informe o que será feito no regime OUTRO.";
    } else if (regimeOutro.length > MAX_REGIME_OUTRO) {
      erros.regimeOutro = `A descrição do regime OUTRO deve ter no máximo ${MAX_REGIME_OUTRO} caracteres.`;
    }
  }

  const hoje = hojeISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    erros.data = "Informe uma data válida (AA/MM/AAAA).";
  } else if (data < hoje) {
    erros.data = "Não é permitido cadastrar saída com data anterior à hoje.";
  }

  if (!/^\d{2}:\d{2}$/.test(hora)) {
    erros.hora = "Informe um horário válido (HH:MM).";
  } else {
    const [hh, mm] = hora.split(":").map(Number);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      erros.hora = "Informe um horário entre 00:00 e 23:59.";
    } else if (ehDataHoraPassada(data, hora)) {
      erros.hora = "Horário inválido: não é permitido cadastrar horário anterior ao horário atual.";
    }
  }

  if (!local) erros.local = "Informe o local de destino.";
  if (!matricula) erros.matricula = "Informe a matrícula.";
  if (!nome) erros.nome = "Informe o nome completo.";
  if (!ehTipo(regime)) erros.regime = "Selecione o regime RSA, FE, CR ou OUTRO.";

  return {
    erros: Object.keys(erros).length > 0 ? erros : null,
    dados: { data, hora, local, matricula, nome, motivo, regime, regimeOutro, veiculo, motorista, horarioPrevisto, naoRealizada, justificativa },
  };
}
