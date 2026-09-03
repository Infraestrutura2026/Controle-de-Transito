import * as XLSX from "xlsx";
import { normalizarRegime } from "./constantes";

export interface LinhaPlanilha {
  linha: number; // número da linha no arquivo (para referência)
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  local: string;
  matricula: string;
  nome: string;
  motivo: string;
  regime: string;
  ok: boolean;
  erro?: string;
}

export interface ResultadoParse {
  linhas: LinhaPlanilha[];
  validas: LinhaPlanilha[];
  problemas: { linha: number; erro: string }[];
  totalLidas: number;
}

/* ---------------- conversores ---------------- */

function dois(n: number) {
  return String(n).padStart(2, "0");
}

/** Converte célula de data (Date, serial do Excel ou texto) para YYYY-MM-DD. */
function parseData(v: unknown): string {
  if (v instanceof Date && !isNaN(v.getTime())) {
    // Datas do Excel são neutras de fuso; UTC evita recuo/avanço de um dia.
    return `${v.getUTCFullYear()}-${dois(v.getUTCMonth() + 1)}-${dois(v.getUTCDate())}`;
  }
  if (typeof v === "number" && isFinite(v)) {
    // serial do Excel (dias desde 1900-01-01, com o bug de 1900)
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${dois(d.getUTCMonth() + 1)}-${dois(d.getUTCDate())}`;
  }
  const s = String(v ?? "").trim();
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const dia = Number(m[1]);
    const mes = Number(m[2]);
    let ano = Number(m[3]);
    if (ano < 100) ano += 2000;
    const iso = `${ano}-${dois(mes)}-${dois(dia)}`;
    // valida data real no calendário (rejeita 31/02, por exemplo)
    const d = new Date(`${iso}T12:00:00`);
    if (d.getFullYear() === ano && d.getMonth() + 1 === mes && d.getDate() === dia) {
      return iso;
    }
    return "";
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const iso = `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(`${iso}T12:00:00`);
    if (d.getFullYear() === Number(m[1]) && d.getMonth() + 1 === Number(m[2]) && d.getDate() === Number(m[3])) {
      return iso;
    }
  }
  return "";
}

/** Converte célula de hora (Date, fração do Excel ou texto) para HH:MM. */
function parseHora(v: unknown): string {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return `${dois(v.getUTCHours())}:${dois(v.getUTCMinutes())}`;
  }
  if (typeof v === "number" && isFinite(v)) {
    const frac = v % 1;
    const total = Math.round(frac * 24 * 60);
    return `${dois(Math.floor(total / 60) % 24)}:${dois(total % 60)}`;
  }
  const s = String(v ?? "").trim();
  // Aceita 7:00, 07:00, 07:00:00 e também 07.00.
  const m = s.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?$/);
  if (m) {
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (h >= 0 && h <= 23 && mi >= 0 && mi <= 59) return `${dois(h)}:${dois(mi)}`;
  }
  const m2 = s.match(/^(\d{2})(\d{2})$/);
  if (m2) {
    const h = Number(m2[1]);
    const mi = Number(m2[2]);
    if (h >= 0 && h <= 23 && mi >= 0 && mi <= 59) return `${m2[1]}:${m2[2]}`;
  }
  return "";
}

function texto(v: unknown): string {
  return String(v ?? "").trim();
}

/* ---------------- detecção de cabeçalho ---------------- */

interface MapaColunas {
  data: number;
  hora: number;
  local: number;
  matricula: number;
  nome: number;
  motivo: number;
  regime: number;
}

function achar(cols: string[], re: RegExp, padrao: number): number {
  const i = cols.findIndex((c) => re.test(c));
  return i >= 0 ? i : padrao;
}

function detectarColunas(linhaCab: string[]): { mapa: MapaColunas; inicioDados: number } {
  const cols = linhaCab.map((c) => String(c ?? "").trim().toLowerCase());
  const temCab = cols.some((c) => /data/.test(c)) && cols.some((c) => /hora/.test(c));
  if (!temCab) {
    // sem cabeçalho reconhecível: layout posicional da planilha original
    return {
      mapa: { data: 0, hora: 1, local: 2, matricula: 3, nome: 4, motivo: 5, regime: 6 },
      inicioDados: 0,
    };
  }
  const ultima = cols.length - 1;
  return {
    mapa: {
      data: achar(cols, /data/, 0),
      hora: achar(cols, /hora/, 1),
      local: achar(cols, /local|hospital|unidade|destino/, 2),
      matricula: achar(cols, /matr|n[úu]mero|prontu|registro/, 3),
      nome: achar(cols, /nome/, 4),
      motivo: achar(cols, /motivo|procedimento|especialidade|atendimento/, 5),
      regime: achar(cols, /regime|tipo|c[óo]digo/, ultima),
    },
    inicioDados: 1,
  };
}

/* ---------------- parse principal ---------------- */

export async function parseArquivoPlanilha(file: File): Promise<ResultadoParse> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];

  // Duas leituras simultâneas evitam ambiguidades:
  // - raw:true mantém Date/serial nativo do Excel para data e hora;
  // - raw:false mantém a exibição original para matrícula (pontos, zeros etc.).
  const brutoRaw = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: true,
  }) as unknown[][];
  const brutoFormatado = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][];

  if (!brutoRaw.length) {
    return { linhas: [], validas: [], problemas: [], totalLidas: 0 };
  }

  const cabecalho = (brutoFormatado[0] ?? brutoRaw[0]).map((c) => String(c ?? ""));
  const { mapa, inicioDados } = detectarColunas(cabecalho);

  const linhas: LinhaPlanilha[] = [];
  for (let i = inicioDados; i < brutoRaw.length; i++) {
    const rRaw = brutoRaw[i] ?? [];
    const rFmt = brutoFormatado[i] ?? rRaw;
    if (rRaw.every((c) => texto(c) === "") && rFmt.every((c) => texto(c) === "")) continue;

    // Datas: prioridade ao valor nativo do Excel para evitar ambiguidade dia/mês.
    // Horas: prioridade ao texto exibido na planilha para preservar exatamente o horário original.
    const data = parseData(rRaw[mapa.data]) || parseData(rFmt[mapa.data]);
    const hora = parseHora(rFmt[mapa.hora]) || parseHora(rRaw[mapa.hora]);
    const local = texto(rFmt[mapa.local]).toUpperCase();
    const matricula = texto(rFmt[mapa.matricula]);
    const nome = texto(rFmt[mapa.nome]).toUpperCase();
    const motivo = texto(rFmt[mapa.motivo]).toUpperCase();
    const regime = texto(rFmt[mapa.regime]).toUpperCase();
    const regimeNorm = normalizarRegime(regime);

    const erros: string[] = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) erros.push("data inválida");
    if (!/^\d{2}:\d{2}$/.test(hora)) erros.push("hora inválida");
    if (!local) erros.push("local vazio");
    if (!matricula) erros.push("matrícula vazia");
    if (!nome) erros.push("nome vazio");
    if (!regimeNorm) erros.push(`regime "${regime || "?"}" não é SA/FE/CR/OUTRO`);

    linhas.push({
      linha: i + 1,
      data,
      hora,
      local,
      matricula,
      nome,
      motivo,
      regime: regimeNorm ?? "",
      ok: erros.length === 0,
      erro: erros.length ? erros.join(", ") : undefined,
    });
  }

  const validas = linhas.filter((l) => l.ok);
  const problemas = linhas
    .filter((l) => !l.ok)
    .map((l) => ({ linha: l.linha, erro: l.erro ?? "" }));

  return { linhas, validas, problemas, totalLidas: linhas.length };
}
