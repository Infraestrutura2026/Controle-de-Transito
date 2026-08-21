type P = { className?: string };

function S({ className = "size-4", children }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconeMais = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const IconeBusca = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </S>
);

export const IconeX = (p: P) => (
  <S {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </S>
);

export const IconeLapis = (p: P) => (
  <S {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </S>
);

export const IconeLixeira = (p: P) => (
  <S {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </S>
);

export const IconeDownload = (p: P) => (
  <S {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </S>
);

export const IconeUpload = (p: P) => (
  <S {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5" />
    <path d="M12 3v12" />
  </S>
);

export const IconeEsquerda = (p: P) => (
  <S {...p}>
    <path d="m15 18-6-6 6-6" />
  </S>
);

export const IconeDireita = (p: P) => (
  <S {...p}>
    <path d="m9 18 6-6-6-6" />
  </S>
);

export const IconeEscudo = (p: P) => (
  <S {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </S>
);

export const IconeCheck = (p: P) => (
  <S {...p}>
    <path d="M20 6 9 17l-5-5" />
  </S>
);

export const IconeAlerta = (p: P) => (
  <S {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </S>
);

export const IconePrancheta = (p: P) => (
  <S {...p}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6M9 16h6" />
  </S>
);

export const IconeOrdenar = (p: P) => (
  <S {...p}>
    <path d="M8 5v14M8 5 5 8M8 5l3 3" />
    <path d="M16 19V5M16 19l-3-3M16 19l3-3" />
  </S>
);

export const IconeRelogio = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </S>
);

export const IconeCarro = (p: P) => (
  <S {...p}>
    <path d="M5 11l1.4-4.2A2 2 0 0 1 8.3 5.4h7.4a2 2 0 0 1 1.9 1.4L19 11" />
    <path d="M3 11h18v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M6.5 14h.01M17.5 14h.01" />
  </S>
);

export const IconeLimpar = (p: P) => (
  <S {...p}>
    <path d="M3 6h18" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </S>
);

export const IconeMenu = (p: P) => (
  <S {...p}>
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </S>
);

export const IconeSair = (p: P) => (
  <S {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </S>
);

export const IconeUsuarios = (p: P) => (
  <S {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </S>
);

export const IconeImpressora = (p: P) => (
  <S {...p}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </S>
);

/** Ícone colorido de gráfico em barras como o do "Dashboard" na imagem enviada */
export function IconeMenuDashboard({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="12" width="4" height="9" rx="1" fill="#60a5fa" />
      <rect x="10" y="5" width="4" height="16" rx="1" fill="#4ade80" />
      <rect x="17" y="9" width="4" height="12" rx="1" fill="#f43f5e" />
    </svg>
  );
}

/** Ícone de mais roxo com brilho como o do "Nova Saída" na imagem enviada */
export function IconeMenuNovaSaida({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 4V20M4 12H20"
        stroke="#a855f7"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ícone de prancheta/documento com clipe como o do "Saídas Cadastradas" na imagem enviada */
export function IconeMenuSaidasCadastradas({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="16" rx="2" fill="#fbbf24" opacity="0.25" />
      <path
        d="M8 3H16M6 7H18V19C18 20.1046 17.1046 21 16 21H8C6.89543 21 6 20.1046 6 19V7Z"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="9" y="2" width="6" height="3" rx="1" fill="#f59e0b" />
      <line x1="9" y1="11" x2="15" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="15" x2="13" y2="15" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Procedimento / Motivo: prancheta âmbar com cruz médica vermelha */
export function IconeMenuProcedimentos({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="18" rx="2" fill="#f59e0b" opacity="0.25" />
      <rect x="5" y="4" width="14" height="18" rx="2" stroke="#f59e0b" strokeWidth="2" />
      <rect x="9" y="2" width="6" height="3.5" rx="1" fill="#f59e0b" />
      <path d="M12 9.5v6M9 12.5h6" stroke="#dc2626" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Por Pessoa: pessoa azul com lupa de histórico */
export function IconeMenuPessoas({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9.5" cy="7.5" r="3.4" fill="#3b82f6" />
      <path d="M3.5 19.5c0-3.3 2.7-6 6-6 1.6 0 3 .6 4.1 1.6" stroke="#3b82f6" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="16.8" cy="15.2" r="3.1" stroke="#1d4ed8" strokeWidth="2" />
      <path d="m19.2 17.6 2.3 2.3" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Por Operador: pessoa teal com selo verde de confirmação */
export function IconeMenuOperadores({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="7.5" r="3.4" fill="#14b8a6" />
      <path d="M3 19.5c0-3.3 2.7-6 6-6 1.4 0 2.7.5 3.7 1.3" stroke="#14b8a6" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="17.3" cy="16" r="4.2" fill="#22c55e" />
      <path d="m15.5 16 1.3 1.3 2.4-2.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Por Motorista: pessoa roxa com volante */
export function IconeMenuMotoristas({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3.2" fill="#a855f7" />
      <path d="M3.2 18.5c0-3.2 2.6-5.8 5.8-5.8 1.3 0 2.6.5 3.5 1.2" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="17" cy="16" r="4.3" stroke="#6b21a8" strokeWidth="2" />
      <circle cx="17" cy="16" r="1.3" fill="#6b21a8" />
      <path d="M17 11.7v3M13.1 17.6l2.7-1M20.9 17.6l-2.7-1" stroke="#6b21a8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Por Veículo: van azul com janelas e rodas */
export function IconeMenuVeiculos({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="2" y="7.5" width="13.5" height="8.5" rx="1.5" fill="#3b82f6" />
      <path d="M15.5 9.5h3.3L22 13v3h-6.5Z" fill="#60a5fa" />
      <rect x="4" y="9.5" width="4" height="3" rx="0.6" fill="#dbeafe" />
      <rect x="9.5" y="9.5" width="4" height="3" rx="0.6" fill="#dbeafe" />
      <circle cx="7" cy="17.5" r="2.1" fill="#111827" />
      <circle cx="17.5" cy="17.5" r="2.1" fill="#111827" />
      <circle cx="7" cy="17.5" r="0.8" fill="#9ca3af" />
      <circle cx="17.5" cy="17.5" r="0.8" fill="#9ca3af" />
    </svg>
  );
}

/** Justificativas: triângulo de atenção âmbar com exclamação */
export function IconeMenuJustificativas({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3.2 22 20.2H2Z" fill="#f59e0b" />
      <path d="M12 3.2 22 20.2H2Z" stroke="#b45309" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 9.5v5" stroke="#7c2d12" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="1.35" fill="#7c2d12" />
    </svg>
  );
}

/** Ícone de relatório diário com dobra de página como o do "Relatório Diário" na imagem enviada */
export function IconeMenuRelatorioDiario({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        fill="#a78bfa"
        opacity="0.2"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2V8H20" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="17" x2="14" y2="17" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
