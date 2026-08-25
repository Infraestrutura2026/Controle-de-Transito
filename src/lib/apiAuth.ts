import { NextResponse } from "next/server";

export function respostaErroAuth(e: unknown): NextResponse | null {
  if (e instanceof Error && e.message === "NAO_AUTENTICADO") {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }
  if (e instanceof Error && e.message === "SEM_PERMISSAO") {
    return NextResponse.json({ erro: "Sem permissão para esta ação." }, { status: 403 });
  }
  return null;
}
