import { NextResponse } from "next/server";
import { encerrarSessaoAtual } from "@/lib/sessao";

export const dynamic = "force-dynamic";

export async function POST() {
  await encerrarSessaoAtual();
  return NextResponse.json({ ok: true });
}
