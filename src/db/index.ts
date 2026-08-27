import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Detecta automaticamente se o banco exige SSL (Neon, Supabase, etc.)
 * e habilita a opcao `rejectUnauthorized: false` (necessaria em ambientes
 * serverless como a Vercel, pois os certificados do pooler nem sempre
 * sao validados pelo CA padrao do Node).
 *
 * O usuario pode forcar o comportamento com DATABASE_SSL=true/false.
 */
function deveUsarSSL(): boolean {
  const force = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (force === "true" || force === "1") return true;
  if (force === "false" || force === "0") return false;
  // Auto-deteccao: Neon, Supabase, Render, etc. usam hosts com SSL obrigatorio
  return /(neon\.tech|supabase\.(co|com)|aws\.neon|render\.com|db\.postgres)/i.test(
    databaseUrl!
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __controleSaidasPool?: Pool;
};

const ssl = deveUsarSSL() ? { rejectUnauthorized: false } : undefined;

export const pool =
  globalForDb.__controleSaidasPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__controleSaidasPool = pool;
}

export const db = drizzle(pool);
