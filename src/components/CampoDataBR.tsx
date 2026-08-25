"use client";

import { forwardRef } from "react";
import { dataBRValida, mascararDataBR } from "@/lib/format";

interface Props {
  id?: string;
  value: string;
  onChange: (valor: string) => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
  required?: boolean;
  invalida?: boolean;
}

/**
 * Campo de data padronizado em DD/MM/AAAA, independente do idioma/navegador.
 * O valor controlado também permanece em DD/MM/AAAA na interface.
 */
const CampoDataBR = forwardRef<HTMLInputElement, Props>(function CampoDataBR(
  { id, value, onChange, className = "", ariaLabel, title, required, invalida },
  ref
) {
  const completa = value.length === 10;
  const possuiErro = invalida || (completa && !dataBRValida(value));

  return (
    <input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      maxLength={10}
      value={value}
      onChange={(e) => onChange(mascararDataBR(e.target.value))}
      placeholder="DD/MM/AAAA"
      autoComplete="off"
      aria-label={ariaLabel}
      aria-invalid={possuiErro || undefined}
      title={title}
      required={required}
      className={`${className} ${possuiErro ? "border-red-400 focus:ring-red-300" : ""}`}
    />
  );
});

export default CampoDataBR;
