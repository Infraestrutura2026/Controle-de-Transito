import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { saidas } from "@/db/schema";
import { validarSaida } from "@/lib/constantes";
import { ehAdministrador, exigirOperador } from "@/lib/sessao";
import { respostaErroAuth } from "@/lib/apiAuth";

type Params = { params: Promise<{ id: string }> };

async function obterId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * PUT /api/saidas/:id — edição exclusiva de administradores.
 * Operadores recebem 403 mesmo que conheçam o endereço da API.
 */
export async function PUT(req: Request, ctx: Params) {
  try {
    const op = await exigirOperador();
    if (!ehAdministrador(op)) {
      return NextResponse.json({ erro: "Sem permissão para editar saídas." }, { status: 403 });
    }
    const id = await obterId(ctx.params);
    if (!id) return NextResponse.json({ erro: "Registro inválido." }, { status: 404 });

    let corpo: Record<string, unknown>;
    try {
      corpo = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
    }
    const { erros, dados } = validarSaida(corpo);
    if (erros) return NextResponse.json({ erros }, { status: 400 });

    const [atualizada] = await db
      .update(saidas)
      .set(dados)
      .where(eq(saidas.id, id))
      .returning();
    if (!atualizada) return NextResponse.json({ erro: "Registro não encontrado." }, { status: 404 });
    return NextResponse.json(atualizada);
  } catch (e) {
    const auth = respostaErroAuth(e);
    if (auth) return auth;
    throw e;
  }
}

/**
 * DELETE /api/saidas/:id — exclusão exclusiva de administradores.
 * Operadores apenas cadastram saídas; não podem editar nem excluir.
 */
export async function DELETE(_req: Request, ctx: Params) {
  try {
    const op = await exigirOperador();
    if (!ehAdministrador(op)) {
      return NextResponse.json({ erro: "Sem permissão para excluir saídas." }, { status: 403 });
    }
    const id = await obterId(ctx.params);
    if (!id) return NextResponse.json({ erro: "Registro inválido." }, { status: 404 });

    const [excluida] = await db.delete(saidas).where(eq(saidas.id, id)).returning();
    if (!excluida) return NextResponse.json({ erro: "Registro não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const auth = respostaErroAuth(e);
    if (auth) return auth;
    throw e;
  }
}
