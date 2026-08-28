"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconeAlerta, IconeCheck } from "./Icons";
import { ehNomeDeAdministrador } from "@/lib/admins";


export default function LoginForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [rs, setRs] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  // Se o nome for de administrador, o segundo campo passa a ser a senha.
  const nomeEhAdmin = ehNomeDeAdministrador(nome);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEntrando(true);
    try {
      const r = await fetch("/api/auth/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, rs }),
      });
      const corpo = await r.json();
      if (!r.ok) throw new Error(corpo?.erro ?? "Não foi possível entrar.");
      router.replace("/");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="mx-auto max-w-sm" noValidate>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-pine-700">Acesso</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Entrar no sistema
        </h2>
        <p className="mt-2 text-sm text-ink-mute">
          Não é necessário criar conta. Informe seu nome e matrícula/RS para
          identificar as saídas que você cadastrar.
        </p>
      </div>

      <label htmlFor="nome" className="mt-7 block text-xs font-semibold text-ink-soft">
        Nome completo
      </label>
      <input
        id="nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        autoComplete="name"
        autoFocus
        className="mt-1 h-11 w-full rounded-lg border border-line-strong bg-white/70 px-3 text-sm uppercase outline-none transition-shadow focus:ring-2 focus:ring-pine-300"
        placeholder="EX.: MARIA DE SOUZA"
      />

      <label htmlFor="rs" className="mt-4 block text-xs font-semibold text-ink-soft">
        {nomeEhAdmin ? "Senha" : "Matrícula / RS"}
      </label>
      <input
        id="rs"
        type={nomeEhAdmin ? "password" : "text"}
        value={rs}
        onChange={(e) => setRs(e.target.value)}
        autoComplete={nomeEhAdmin ? "current-password" : "off"}
        className="mt-1 h-11 w-full rounded-lg border border-line-strong bg-white/70 px-3 font-display tabular-nums text-sm outline-none transition-shadow focus:ring-2 focus:ring-pine-300"
        placeholder={nomeEhAdmin ? "Digite a senha do administrador" : "Ex.: 123.456-7"}
      />

      {erro && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <IconeAlerta className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={entrando}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-pine-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pine-800 disabled:opacity-60"
      >
        {entrando ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <IconeCheck className="size-4" />
        )}
        {entrando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
