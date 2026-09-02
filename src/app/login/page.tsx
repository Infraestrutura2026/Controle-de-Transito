import { redirect } from "next/navigation";
import { operadorAtual } from "@/lib/sessao";
import { NOME_UNIDADE, SETOR_RESPONSAVEL } from "@/lib/unidade";
import Brasao from "@/components/Brasao";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const op = await operadorAtual();
  if (op) redirect("/");

  return (
    <main className="grid min-h-screen grid-cols-2 text-paper">
      {/* Lado esquerdo — identidade institucional */}
      <section className="relative flex flex-col justify-center overflow-hidden bg-ink px-6 py-10 text-paper sm:px-12 lg:px-16 xl:px-24">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#f3d479_0,transparent_28%),radial-gradient(circle_at_90%_10%,#7cbba9_0,transparent_24%)]" />
        {/* Brasão oficial como marca d'água atrás do bloco "Controle de Saídas". */}
        <Brasao className="pointer-events-none absolute left-1/2 top-1/2 w-[70%] max-w-[440px] -translate-x-1/2 -translate-y-1/2 opacity-[0.10] select-none" />
        <div className="relative z-10 mx-auto w-full max-w-xl text-center">
          <h1 className="font-display text-3xl font-semibold uppercase leading-tight tracking-tight sm:text-5xl xl:text-6xl">
            {"Controle de Saídas de PPL's"}
          </h1>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-hl-300 sm:text-base">
            {NOME_UNIDADE}
          </p>
          <p className="mt-3 text-base font-medium text-paper/60 sm:text-lg">{SETOR_RESPONSAVEL}</p>
        </div>
        {/* faixa de acento na base, nas mesmas cores do sistema */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-hl-500 via-pine-600 to-hl-300" />
      </section>

      {/* Lado direito — formulário de acesso */}
      <section className="relative flex items-center justify-center bg-surface p-4 text-ink sm:p-10">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-pine-600/60 via-line to-hl-300/60" />
        <LoginForm />
      </section>
    </main>
  );
}
