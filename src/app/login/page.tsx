import { redirect } from "next/navigation";
import { operadorAtual } from "@/lib/sessao";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import Brasao from "@/components/Brasao";
import LoginForm from "@/components/LoginForm";
import { IconeEscudo } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const op = await operadorAtual();
  if (op) redirect("/");

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-8 text-paper">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-surface text-ink shadow-2xl sm:grid sm:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden bg-ink p-7 text-paper sm:p-9">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#f3d479_0,transparent_28%),radial-gradient(circle_at_90%_10%,#7cbba9_0,transparent_24%)]" />
          {/* Halo de luz bem suave para dar contraste à marca d'água sobre o fundo escuro. */}
          <div className="pointer-events-none absolute left-1/2 top-[54%] size-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-2xl [background:radial-gradient(circle,rgba(244,243,238,0.22)_0%,transparent_60%)] sm:size-[400px]" />
          {/* Brasão oficial da Polícia Penal como marca d'água atrás do bloco "Controle de Saídas". */}
          <Brasao className="pointer-events-none absolute left-1/2 top-[54%] w-[250px] -translate-x-1/2 -translate-y-1/2 opacity-[0.20] select-none sm:w-[290px]" />
          <div className="relative z-10">
            <div className="mb-8 grid size-12 place-items-center rounded-xl bg-pine-600 ring-1 ring-white/10">
              <IconeEscudo className="size-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-hl-300">
              {NOME_UNIDADE}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Controle de Saídas
            </h1>
            <p className="mt-1 text-sm font-medium text-paper/60">{SETOR_RESPONSAVEL}</p>

          </div>
        </section>
        <section className="p-6 sm:p-9">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
