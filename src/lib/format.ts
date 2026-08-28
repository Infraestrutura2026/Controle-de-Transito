type PartesAgoraSP = {
  ano: string;
  mes: string;
  dia: string;
  hora: string;
  minuto: string;
  semana: string;
};

function agoraSP(): PartesAgoraSP {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? "";
  return {
    ano: valor("year"),
    mes: valor("month"),
    dia: valor("day"),
    hora: valor("hour"),
    minuto: valor("minute"),
    semana: valor("weekday"),
  };
}

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

/** Data de hoje no formato AAAA-MM-DD, no fuso de São Paulo. */
export function hojeISO(): string {
  const { ano, mes, dia } = agoraSP();
  return `${ano}-${mes}-${dia}`;
}

/** Data de hoje no formato visual DD/MM/AAAA, no fuso de São Paulo. */
export function hojeBR(): string {
  return formatarDataBR(hojeISO());
}

/** Primeiro dia do mês atual em DD/MM/AAAA, no fuso de São Paulo. */
export function primeiroDiaMesBR(): string {
  const { ano, mes } = agoraSP();
  return `01/${mes}/${ano}`;
}

/** Data de N dias atrás em DD/MM/AAAA, calculada no calendário de São Paulo. */
export function diasAtrasBR(n: number): string {
  const agora = agoraSP();
  const data = new Date(Date.UTC(Number(agora.ano), Number(agora.mes) - 1, Number(agora.dia) - n));
  return `${String(data.getUTCDate()).padStart(2, "0")}/${String(data.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}/${data.getUTCFullYear()}`;
}

/** Ex.: "terça-feira, 25/08/2026" — sempre no padrão brasileiro. */
export function dataLongaBR(): string {
  const { ano, mes, dia, semana } = agoraSP();
  return `${semana}, ${dia}/${mes}/${ano}`;
}
