import { NextResponse } from "next/server";
import { db } from "@/db";
import { saidas } from "@/db/schema";
import { ehAdministrador, exigirOperador } from "@/lib/sessao";
import { respostaErroAuth } from "@/lib/apiAuth";
import { normalizarRegime } from "@/lib/constantes";

export const dynamic = "force-dynamic";

interface LinhaImportar {
  data: string;
  hora: string;
  local: string;
  matricula: string;
  nome: string;
  motivo: string;
  regime: string;
}

function chave(l: { data: string; hora: string; local: string; matricula: string; nome: string }) {
  return `${l.data}|${l.hora}|${l.matricula}|${l.nome.trim().toUpperCase()}|${l.local.trim().toUpperCase()}`;
}

/**
 * POST /api/saidas/importar — exclusivo de administradores.
 * Body: { linhas: LinhaImportar[] }
 *
 * - NÃO aplica a trava de "horário anterior ao atual" (a planilha contém histórico).
 * - Ignora duplicatas já existentes no banco (mesma data+hora+matrícula+nome+local).
 */
export async function POST(req: Request) {
  try {
    const op = await exigirOperador();
    if (!ehAdministrador(op)) {
      return NextResponse.json({ erro: "Somente administradores podem importar planilhas." }, { status: 403 });
    }

    let corpo: { linhas?: LinhaImportar[] };
    try {
      corpo = (await req.json()) as { linhas?: LinhaImportar[] };
    } catch {
      return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
    }

    const brutas = Array.isArray(corpo.linhas) ? corpo.linhas : [];
    if (!brutas.length) {
      return NextResponse.json({ erro: "Nenhuma linha válida para importar." }, { status: 400 });
    }
    if (brutas.length > 5000) {
      return NextResponse.json({ erro: "Limite de 5000 linhas por importação." }, { status: 400 });
    }

    // valida linha a linha (sem regra de horário passado)
    const validas: LinhaImportar[] = [];
    let invalidas = 0;
    for (const l of brutas) {
      const regime = normalizarRegime(l.regime);
      if (
        regime &&
        /^\d{4}-\d{2}-\d{2}$/.test(l.data) &&
        /^\d{2}:\d{2}$/.test(l.hora) &&
        !!l.local?.trim() &&
        !!l.matricula?.trim() &&
        !!l.nome?.trim()
      ) {
        validas.push({
          data: l.data,
          hora: l.hora,
          local: l.local.trim().toUpperCase(),
          matricula: l.matricula.trim(),
          nome: l.nome.trim().toUpperCase(),
          motivo: (l.motivo ?? "").trim().toUpperCase(),
          regime,
        });
      } else {
        invalidas++;
      }
    }

    // duplicatas já existentes no banco
    const existentes = await db
      .select({
        data: saidas.data,
        hora: saidas.hora,
        local: saidas.local,
        matricula: saidas.matricula,
        nome: saidas.nome,
      })
      .from(saidas);
    const setExistentes = new Set(existentes.map(chave));

    const novas = validas.filter((l) => !setExistentes.has(chave(l)));
    const duplicadas = validas.length - novas.length;

    // insere em lotes de 500
    let importadas = 0;
    for (let i = 0; i < novas.length; i += 500) {
      const lote = novas.slice(i, i + 500).map((l) => ({
        ...l,
        criadoPorNome: op.nome,
        criadoPorRs: op.rs,
      }));
      const inseridas = await db.insert(saidas).values(lote).returning({ id: saidas.id });
      importadas += inseridas.length;
    }

    return NextResponse.json({
      importadas,
      duplicadas,
      invalidas,
      totalRecebido: brutas.length,
    });
  } catch (e) {
    const auth = respostaErroAuth(e);
    if (auth) return auth;
    throw e;
  }
}
