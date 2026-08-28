import { NextResponse } from "next/server";
import { and, asc, desc, eq, ilike, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { saidas } from "@/db/schema";
import { ehTipo, validarSaida } from "@/lib/constantes";
import { ehAdministrador, exigirOperador } from "@/lib/sessao";
import { respostaErroAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function escopoOperador(nome: string, rs: string): SQL[] {
  return [eq(saidas.criadoPorNome, nome), eq(saidas.criadoPorRs, rs)];
}

function escopoDoOperador(op: { nome: string; rs: string }): SQL[] {
  // Administradores veem tudo; operadores veem apenas o próprio.
  return ehAdministrador(op) ? [] : escopoOperador(op.nome, op.rs);
}

export async function GET(req: Request) {
  try {
    const op = await exigirOperador();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const local = searchParams.get("local") ?? "";
    const regime = searchParams.get("tipo") ?? searchParams.get("regime") ?? "";
    const de = searchParams.get("de") ?? "";
    const ate = searchParams.get("ate") ?? "";
    const pagina = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const perPage = Math.min(100000, Math.max(1, Number(searchParams.get("perPage") ?? "25") || 25));
    const campoParam = searchParams.get("sort") ?? "data";
    const campo = ["data", "hora", "nome", "local"].includes(campoParam) ? campoParam : "data";
    const dir = searchParams.get("dir") === "asc" ? "asc" : "desc";

    // Administradores veem todas as saídas; operadores veem apenas as próprias.
    const escopo = escopoDoOperador(op);
    const ondeEscopo = escopo.length > 0 ? and(...escopo) : undefined;

    const conds: SQL[] = [...escopo];
    if (q) {
      conds.push(
        or(
          ilike(saidas.nome, `%${q}%`),
          ilike(saidas.matricula, `%${q}%`),
          ilike(saidas.motivo, `%${q}%`),
          ilike(saidas.local, `%${q}%`)
        )!
      );
    }
    if (local) conds.push(eq(saidas.local, local));
    if (regime && ehTipo(regime)) conds.push(eq(saidas.regime, regime));
    if (/^\d{4}-\d{2}-\d{2}$/.test(de)) conds.push(sql`${saidas.data} >= ${de}`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(ate)) conds.push(sql`${saidas.data} <= ${ate}`);
    const onde = conds.length > 0 ? and(...conds) : undefined;

    const [totalR] = await db.select({ n: sql<number>`count(*)` }).from(saidas).where(onde);
    const total = Number(totalR.n);
    const paginas = Math.max(1, Math.ceil(total / perPage));
    const pag = Math.min(pagina, paginas);

    const ordenar = dir === "asc" ? asc : desc;
    let ordem: SQL[];
    if (campo === "nome") ordem = [ordenar(saidas.nome), ordenar(saidas.data)];
    else if (campo === "local") ordem = [ordenar(saidas.local), ordenar(saidas.data)];
    else if (campo === "hora") ordem = [ordenar(saidas.hora), ordenar(saidas.data)];
    else ordem = [ordenar(saidas.data), ordenar(saidas.hora)];

    const itens = await db
      .select()
      .from(saidas)
      .where(onde)
      .orderBy(...ordem)
      .limit(perPage)
      .offset((pag - 1) * perPage);

    const hoje = hojeISO();
    const mes = hoje.slice(0, 7);
    const [tR] = await db.select({ n: sql<number>`count(*)` }).from(saidas).where(ondeEscopo);
    const [hR] = await db
      .select({ n: sql<number>`count(*)` })
      .from(saidas)
      .where(and(...escopo, eq(saidas.data, hoje)));
    const [mR] = await db
      .select({ n: sql<number>`count(*)` })
      .from(saidas)
      .where(and(...escopo, like(saidas.data, `${mes}%`)));
    const porRegimeR = await db
      .select({ regime: saidas.regime, n: sql<number>`count(*)` })
      .from(saidas)
      .where(ondeEscopo)
      .groupBy(saidas.regime);
    const porRegime: Record<string, number> = { RSA: 0, FE: 0, CR: 0, OUTRO: 0 };
    for (const r of porRegimeR) porRegime[r.regime] = Number(r.n);

    const locais = await db
      .select({ local: saidas.local })
      .from(saidas)
      .where(ondeEscopo)
      .groupBy(saidas.local)
      .orderBy(asc(saidas.local));

    return NextResponse.json({
      itens,
      total,
      pagina: pag,
      paginas,
      resumo: { total: Number(tR.n), hoje: Number(hR.n), mes: Number(mR.n), porRegime },
      locais: locais.map((l) => l.local),
    });
  } catch (e) {
    const auth = respostaErroAuth(e);
    if (auth) return auth;
    throw e;
  }
}

export async function POST(req: Request) {
  try {
    const op = await exigirOperador();
    let corpo: Record<string, unknown>;
    try {
      corpo = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
    }
    const { erros, dados } = validarSaida(corpo);
    if (erros) return NextResponse.json({ erros }, { status: 400 });
    // Veículo, motorista, horário previsto e justificativa de não realização são exclusivos do administrador.
    const valores = { ...dados, criadoPorNome: op.nome, criadoPorRs: op.rs };
    if (!ehAdministrador(op)) {
      valores.veiculo = "";
      valores.motorista = "";
      valores.horarioPrevisto = "";
      valores.naoRealizada = false;
      valores.justificativa = "";
    }
    // regimeOutro só é válido quando regime = OUTRO
    if (valores.regime !== "OUTRO") {
      valores.regimeOutro = "";
    }
    const [linha] = await db.insert(saidas).values(valores).returning();
    return NextResponse.json(linha, { status: 201 });
  } catch (e) {
    const auth = respostaErroAuth(e);
    if (auth) return auth;
    throw e;
  }
}
