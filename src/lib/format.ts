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

/** Data local de hoje no formato AAAA-MM-DD (uso interno/API). */
export function hojeISO(): string {
  const d = new Date();
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
  const d = new Date();
  return `01/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** Data de N dias atrás em DD/MM/AAAA. */
export function diasAtrasBR(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}/${d.getFullYear()}`;
}

/** Ex.: "terça-feira, 25/08/2026" — sempre no padrão brasileiro. */
export function dataLongaBR(): string {
  const agora = new Date();
  const semana = agora.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${semana}, ${hojeBR()}`;
}
