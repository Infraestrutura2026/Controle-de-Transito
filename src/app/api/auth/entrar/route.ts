import { NextResponse } from "next/server";
import {
  criarSessao,
  ehValidoNome,
  ehValidoRS,
  nomeCorrespondeAAdmin,
  obterAdmin,
} from "@/lib/sessao";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/entrar
 * Body: { nome, rs }
 *
 * - Administradores: nome = zanoni/osvaldo e o campo "rs" traz a senha.
 *   Com as credenciais corretas, abre a sessão de administrador (acesso total).
 * - Operadores: qualquer nome + matrícula/RS (sem senha).
 *
 * Cria uma sessão de 7 dias e grava o cookie httpOnly.
 */
export async function POST(req: Request) {
  let corpo: { nome?: string; rs?: string };
  try {
    corpo = (await req.json()) as { nome?: string; rs?: string };
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const nome = String(corpo.nome ?? "").trim();
  const valorRsOuSenha = String(corpo.rs ?? "").trim();

  // ---- caminho do administrador (usuário + senha) ----
  if (nomeCorrespondeAAdmin(nome)) {
    const admin = obterAdmin(nome, valorRsOuSenha);
    if (!admin) {
      return NextResponse.json(
        { erro: "Senha do administrador incorreta." },
        { status: 401 }
      );
    }
    await criarSessao(admin.nome, admin.senha);
    return NextResponse.json({
      operador: { nome: admin.nome, rs: admin.senha },
      admin: true,
    });
  }

  // ---- caminho do operador (nome + matrícula/RS) ----
  if (!ehValidoNome(nome)) {
    return NextResponse.json(
      { erro: "Informe um nome válido (entre 3 e 100 caracteres)." },
      { status: 400 }
    );
  }
  if (!ehValidoRS(valorRsOuSenha)) {
    return NextResponse.json(
      { erro: "Informe uma matrícula/RS válida (somente letras, números e . - /)." },
      { status: 400 }
    );
  }

  await criarSessao(nome, valorRsOuSenha);
  return NextResponse.json({
    operador: {
      nome: nome.replace(/\s+/g, " "),
      rs: valorRsOuSenha.replace(/\s+/g, ""),
    },
    admin: false,
  });
}
