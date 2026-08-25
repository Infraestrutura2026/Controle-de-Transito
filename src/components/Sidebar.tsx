"use client";

import { NOME_UNIDADE } from "@/lib/unidade";
import Brasao from "./Brasao";
import {
  IconeMenuDashboard,
  IconeMenuNovaSaida,
  IconeMenuSaidasCadastradas,
  IconeMenuRelatorioDiario,
  IconeSair,
  IconeMenu,
  IconeX,
} from "./Icons";

export type AbaNavegacao = "dashboard" | "saidas" | "relatorio";

interface OperadorResumo {
  nome: string;
  rs: string;
}

interface Props {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
  aoAbrirNovaSaida: () => void;
  operador: OperadorResumo;
  ehAdmin: boolean;
  aoSair: () => void;
  menuAbertoMobile: boolean;
  setMenuAbertoMobile: (v: boolean) => void;
}

export default function Sidebar({
  abaAtiva,
  aoMudarAba,
  aoAbrirNovaSaida,
  operador,
  ehAdmin,
  aoSair,
  menuAbertoMobile,
  setMenuAbertoMobile,
}: Props) {
  // Operadores: somente Nova Saída e Saídas Cadastradas.
  // Administradores: acesso completo ao Dashboard e Relatório Diário.
  const itens = [
    ...(ehAdmin
      ? [
          {
            id: "dashboard" as AbaNavegacao,
            label: "Dashboard",
            icone: <IconeMenuDashboard className="size-5 shrink-0" />,
            acao: () => {
              aoMudarAba("dashboard");
              setMenuAbertoMobile(false);
            },
          },
        ]
      : []),
    {
      id: "nova_saida" as const,
      label: "Nova Saída",
      icone: <IconeMenuNovaSaida className="size-5 shrink-0" />,
      acao: () => {
        aoAbrirNovaSaida();
        setMenuAbertoMobile(false);
      },
      destaqueRoxo: true,
    },
    {
      id: "saidas" as AbaNavegacao,
      label: "Saídas Cadastradas",
      icone: <IconeMenuSaidasCadastradas className="size-5 shrink-0" />,
      acao: () => {
        aoMudarAba("saidas");
        setMenuAbertoMobile(false);
      },
    },
    ...(ehAdmin
      ? [
          {
            id: "relatorio" as AbaNavegacao,
            label: "Relatórios",
            icone: <IconeMenuRelatorioDiario className="size-5 shrink-0" />,
            acao: () => {
              aoMudarAba("relatorio");
              setMenuAbertoMobile(false);
            },
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Botão de abrir menu no mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-[#141d2b] px-4 text-white lg:hidden print:hidden">
        <div className="flex items-center gap-2.5">
          <Brasao className="size-8 shrink-0" />
          <span className="font-display font-semibold text-sm">Controle de Saídas</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuAbertoMobile(!menuAbertoMobile)}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          aria-label="Toggle menu"
        >
          {menuAbertoMobile ? <IconeX className="size-6" /> : <IconeMenu className="size-6" />}
        </button>
      </div>

      {/* Overlay escuro para mobile */}
      {menuAbertoMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden print:hidden"
          onClick={() => setMenuAbertoMobile(false)}
        />
      )}

      {/* Barra Lateral Principal */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-[#141d2b] text-slate-200 transition-transform duration-200 lg:translate-x-0 print:hidden ${
          menuAbertoMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Cabeçalho do App / Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-5">
          <Brasao className="size-10 shrink-0" />
          <div className="overflow-hidden">
            <h1 className="truncate font-display text-sm font-bold tracking-tight text-white">
              Controle de Saídas
            </h1>
            <p className="truncate text-[11px] font-medium text-slate-400">{NOME_UNIDADE.toUpperCase()}</p>
          </div>
        </div>

        {/* Lista de Navegação no Menu Lateral (estilo idêntico à imagem) */}
        <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
          {itens.map((item) => {
            const ehAtivo = item.id !== "nova_saida" && abaAtiva === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.acao}
                className={`group flex w-full items-center gap-3.5 rounded-lg px-3.5 py-3 text-sm font-semibold transition-all ${
                  ehAtivo
                    ? "bg-[#1e2e42] text-sky-400 shadow-sm"
                    : "text-slate-300 hover:bg-[#1a2638] hover:text-white"
                }`}
              >
                {item.icone}
                <span
                  className={
                    ehAtivo
                      ? "text-sky-400 font-bold"
                      : item.destaqueRoxo
                        ? "text-slate-200 group-hover:text-purple-300"
                        : "text-slate-200"
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Perfil e Botão Sair na parte inferior */}
        <div className="border-t border-slate-800/80 bg-[#0f1724] p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <p className="truncate font-display text-xs font-bold text-white">{operador.nome}</p>
              {ehAdmin ? (
                <p className="truncate text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Administrador · acesso total
                </p>
              ) : (
                <p className="truncate text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  RS {operador.rs}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={aoSair}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300"
              title="Sair do sistema"
            >
              <IconeSair className="size-3.5" />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
