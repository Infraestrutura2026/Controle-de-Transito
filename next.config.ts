import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite o domínio do preview de desenvolvimento (opcional, via env).
  // Em produção esta opção não tem efeito.
  allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGIN
    ? [process.env.NEXT_ALLOWED_DEV_ORIGIN]
    : [],
};

export default nextConfig;
