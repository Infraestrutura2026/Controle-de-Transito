import Image from "next/image";

/**
 * Brasão oficial da Polícia Penal do Estado de São Paulo.
 * Arquivo com fundo transparente: /public/brasao.png
 *
 * Usado como marca d'água no login, no menu lateral, no cabeçalho das
 * páginas e nos cabeçalhos dos relatórios.
 */
export default function Brasao({ className = "size-16" }: { className?: string }) {
  return (
    <Image
      src="/brasao.png"
      alt="Brasão da Polícia Penal do Estado de São Paulo"
      width={384}
      height={520}
      className={className}
      style={{ objectFit: "contain" }}
      draggable={false}
      unoptimized
    />
  );
}
