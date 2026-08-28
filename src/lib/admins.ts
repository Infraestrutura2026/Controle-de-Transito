/**
 * Nomes de usuário dos administradores do sistema.
 *
 * Este arquivo NÃO contém senhas — ele é importado também pela tela de login
 * (componente de cliente), apenas para saber quando o segundo campo deve virar
 * "Senha" em vez de "Matrícula / RS".
 *
 * As senhas ficam em `src/lib/sessao.ts` (código executado só no servidor).
 * Para adicionar/remover um administrador, altere as DUAS listas.
 */
export const NOMES_ADMINISTRADORES = ["zanoni", "osvaldo"] as const;

/** Compara nomes ignorando maiúsculas/minúsculas e espaços extras. */
export function compararNomeAdmin(a: string, b: string): boolean {
  const norm = (v: string) => v.trim().replace(/\s+/g, " ").toUpperCase();
  return norm(a) === norm(b);
}

/** Verifica se o nome digitado é de um administrador (sem validar a senha). */
export function ehNomeDeAdministrador(nome: string): boolean {
  return NOMES_ADMINISTRADORES.some((n) => compararNomeAdmin(n, nome));
}
