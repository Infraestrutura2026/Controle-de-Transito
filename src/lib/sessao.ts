import "server-only";

import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import { db } from "@/db";
import { sessoes } from "@/db/schema";

/**
 * Sessões simplificadas:
 * - O usuário NÃO cria conta.
 * - Operadores: apenas informam Nome + RS (matrícula) na tela inicial, sem senha.
 * - Administradores (zanoni / osvaldo): entram com usuário + senha.
 * - Geramos um token de sessão de 7 dias vinculado a esse par.
 * - Cada saída cadastrada fica com o nome+RS de quem cadastrou.
 *
 * Permissões:
 * - Administradores: veem TODAS as saídas cadastradas por qualquer pessoa,
 *   podem excluir qualquer registro e exportar o conjunto completo.
 * - Demais operadores: veem e excluem apenas as saídas que eles mesmos
 *   cadastraram (identificadas pelo par nome + RS).
 */

export const COOKIE_SESSAO = "controle_saidas_sessao";
const DIAS_SESSAO = 7;

/**
 * Os administradores do sistema.
 * - LOGIN: usuário (nome) + senha.
 * - A "senha" fica gravada no campo RS da sessão do administrador,
 *   mantendo o mesmo mecanismo de identificação das saídas.
 *
 * Para adicionar/remover um administrador, altere também a lista
 * `NOMES_ADMINISTRADORES` em `src/lib/admins.ts` (usada pela tela de login).
 *
 * As senhas podem ser sobrescritas por variáveis de ambiente (recomendado em
 * produção — Vercel → Settings → Environment Variables), sem precisar mexer
 * no código: SENHA_ADMIN_ZANONI e SENHA_ADMIN_OSVALDO.
 */
export const ADMIN_INICIAL_1 = {
  nome: "zanoni",
  senha: process.env.SENHA_ADMIN_ZANONI?.trim() || "Infr@2026",
};

export const ADMIN_INICIAL_2 = {
  nome: "osvaldo",
  senha: process.env.SENHA_ADMIN_OSVALDO?.trim() || "Infr@2026",
};

export const ADMINISTRADORES = [ADMIN_INICIAL_1, ADMIN_INICIAL_2];

export interface Operador {
  nome: string;
  rs: string;
}

function compararNome(a: string, b: string): boolean {
  const norm = (v: string) => v.trim().replace(/\s+/g, " ").toUpperCase();
  return norm(a) === norm(b);
}

function compararSenha(a: string, b: string): boolean {
  const norm = (v: string) => v.trim().replace(/\s+/g, "");
  return norm(a) === norm(b);
}

/** Verifica se o nome digitado corresponde a um dos administradores. */
export function nomeCorrespondeAAdmin(nome: string): boolean {
  return ADMINISTRADORES.some((a) => compararNome(a.nome, nome));
}

/** Autentica um administrador por usuário + senha. Retorna o admin ou null. */
export function obterAdmin(nome: string, senha: string) {
  const admin = ADMINISTRADORES.find((a) => compararNome(a.nome, nome));
  if (admin && compararSenha(admin.senha, senha)) return admin;
  return null;
}

/**
 * Verifica se o par (nome, RS) de uma sessão corresponde a um dos
 * administradores (o campo RS da sessão admin guarda a senha usada no login).
 */
export function ehAdministrador(op: { nome: string; rs: string } | null | undefined): boolean {
  if (!op) return false;
  return ADMINISTRADORES.some(
    (a) => compararNome(a.nome, op.nome) && compararSenha(a.senha, op.rs)
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

function normalizarRS(rs: string): string {
  return rs.trim().replace(/\s+/g, "");
}

export function ehValidoRS(rs: string): boolean {
  return /^[A-Za-z0-9.\-/]{2,30}$/.test(rs);
}

export function ehValidoNome(nome: string): boolean {
  return normalizarNome(nome).length >= 3 && normalizarNome(nome).length <= 100;
}

/** Cria sessão vinculada a (nome, rs) e grava cookie httpOnly. */
export async function criarSessao(nome: string, rs: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DIAS_SESSAO * 24 * 60 * 60 * 1000);

  await db.insert(sessoes).values({
    tokenHash: hashToken(token),
    nome: normalizarNome(nome),
    rs: normalizarRS(rs),
    expiraEm,
  });

  const store = await cookies();
  store.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });
}

/** Encerra a sessão atual (remove do banco e apaga o cookie). */
export async function encerrarSessaoAtual(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_SESSAO)?.value;
  if (token) {
    await db.delete(sessoes).where(eq(sessoes.tokenHash, hashToken(token)));
  }
  store.delete(COOKIE_SESSAO);
}

/**
 * Retorna o operador (nome+rs) logado na sessão atual, ou null se não houver
 * sessão válida. Este é o método de autenticação usado em todas as APIs.
 */
export async function operadorAtual(): Promise<Operador | null> {
  const store = await cookies();
  const token = store.get(COOKIE_SESSAO)?.value;
  if (!token) return null;

  const [sessao] = await db
    .select()
    .from(sessoes)
    .where(and(eq(sessoes.tokenHash, hashToken(token)), gt(sessoes.expiraEm, new Date())))
    .limit(1);

  if (!sessao) return null;
  return { nome: sessao.nome, rs: sessao.rs };
}

/** Lança erro padronizado quando a sessão não existe. */
export async function exigirOperador(): Promise<Operador> {
  const op = await operadorAtual();
  if (!op) throw new Error("NAO_AUTENTICADO");
  return op;
}

export function erroNaoAutenticado(): Error {
  return new Error("NAO_AUTENTICADO");
}

/** Constrói o cookie de logout em respostas diretas (uso opcional). */
export async function limparCookieSessao() {
  const store = await cookies();
  store.delete(COOKIE_SESSAO);
}
