import { NextResponse } from "next/server";
import { ehAdministrador, operadorAtual } from "@/lib/sessao";

export const dynamic = "force-dynamic";

export async function GET() {
  const op = await operadorAtual();
  return NextResponse.json({
    operador: op,
    admin: ehAdministrador(op),
  });
}
