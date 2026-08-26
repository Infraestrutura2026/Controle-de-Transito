/** Converte "AAAA-MM-DD" para "DD/MM/AAAA". */
export function formatarDataBR(iso: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/** Aplica progressivamente a máscara DD/MM/AAAA. */
export function mascararDataBR(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/** Verifica se uma data DD/MM/AAAA existe no calendário. */
export function dataBRValida(br: string): boolean {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const d = new Date(ano, mes - 1, dia, 12, 0, 0);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}

/** Converte DD/MM/AAAA para AAAA-MM-DD; retorna vazio se inválida. */
export function dataBRParaISO(br: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(br)) return br;
  if (!dataBRValida(br)) return "";
  const [d, m, a] = br.split("/");
  return `${a}-${m}-${d}`;
}

/**
 * "Relógio" do sistema no fuso de São Paulo (America/Sao_Paulo).
 *
 * Servidores na nuvem (Vercel, etc.) costumam rodar em UTC. Sem esta
 * conversão, entre 00:00 e 03:00 (horário de Brasília) o sistema
 * consideraria "amanhã" e rejeitaria saídas com a data de hoje.
 * Retorna um Date cujos campos locais (getFullYear, getMonth, ...)
 * correspondem ao horário de São Paulo.
 */
export function agoraNoBrasil(): Date {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const v: Record<string, number> = {};
  for (const p of partes) {
    if (p.type !== "literal") v[p.type] = Number(p.value);
  }
  const hora = v.hour === 24 ? 0 : v.hour; // alguns motores retornam "24" p/ meia-noite
  return new Date(v.year, v.month - 1, v.day, hora, v.minute, v.second);
}

/** Data local de hoje no formato AAAA-MM-DD (uso interno/API). */
export function hojeISO(): string {
  const d = agoraNoBrasil();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Data local de hoje no formato visual DD/MM/AAAA. */
export function hojeBR(): string {
  return formatarDataBR(hojeISO());
}

/** Primeiro dia do mês atual em DD/MM/AAAA. */
export function primeiroDiaMesBR(): string {
  const d = agoraNoBrasil();
  return `01/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** Data de N dias atrás em DD/MM/AAAA. */
export function diasAtrasBR(n: number): string {
  const d = agoraNoBrasil();
  d.setDate(d.getDate() - n);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}/${d.getFullYear()}`;
}

/** Ex.: "terça-feira, 25/08/2026" — sempre no padrão brasileiro. */
export function dataLongaBR(): string {
  const agora = agoraNoBrasil();
  const semana = agora.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${semana}, ${hojeBR()}`;
}
