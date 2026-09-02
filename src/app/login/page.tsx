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
    <main className="grid min-h-screen text-paper lg:grid-cols-2">
      {/* Metade esquerda — identidade institucional */}
      <section className="relative flex flex-col justify-center overflow-hidden bg-ink px-8 py-12 text-paper sm:px-14 lg:px-16 xl:px-24">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#f3d479_0,transparent_28%),radial-gradient(circle_at_90%_10%,#7cbba9_0,transparent_24%)]" />
        {/* Brasão oficial como marca d'água atrás do bloco "Controle de Saídas". */}
        <Brasao className="pointer-events-none absolute left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 opacity-[0.09] select-none xl:w-[440px]" />
        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-8 grid size-12 place-items-center rounded-xl bg-pine-600 ring-1 ring-white/10">
            <IconeEscudo className="size-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-hl-300">
            {NOME_UNIDADE}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight xl:text-5xl">
            Controle de Saídas
          </h1>
          <p className="mt-2 text-sm font-medium text-paper/60">{SETOR_RESPONSAVEL}</p>
        </div>
        {/* faixa de acento na base, nas mesmas cores do sistema */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-hl-500 via-pine-600 to-hl-300" />
      </section>

      {/* Metade direita — formulário de acesso */}
      <section className="relative flex items-center justify-center bg-surface p-6 text-ink sm:p-12">
        <div className="absolute inset-y-0 left-0 hidden w-1 bg-gradient-to-b from-pine-600/60 via-line to-hl-300/60 lg:block" />
        <LoginForm />
      </section>
    </main>
  );
}
