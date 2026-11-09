import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { schemaStatements } from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

const globalForDb = globalThis as unknown as { __maysaSchemaReady?: Promise<unknown> };

/**
 * Cria as tabelas (se ainda não existirem) uma vez por instância do servidor.
 * Roda numa única transação com trava, para que duas instâncias iniciando ao
 * mesmo tempo não tentem criar as tabelas juntas.
 */
function ensureSchema(sql: NeonQueryFunction<false, false>) {
  globalForDb.__maysaSchemaReady ??= sql
    .transaction([
      sql`select pg_advisory_xact_lock(727274)`,
      ...schemaStatements.map((statement) => sql.query(statement)),
    ])
    .catch((error) => {
      globalForDb.__maysaSchemaReady = undefined; // tenta de novo na próxima requisição
      throw error;
    });
  return globalForDb.__maysaSchemaReady;
}

/**
 * Em produção usa o Neon (DATABASE_URL, criada pela integração Neon da Vercel).
 * Em desenvolvimento, sem DATABASE_URL, usa um Postgres local embutido (PGlite,
 * pasta .data/) para que `npm run dev` funcione sem nenhuma configuração.
 */
export function getSql(): Sql {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (databaseUrl) {
    const sql = neon(databaseUrl);
    return async (strings, ...values) => {
      await ensureSchema(sql);
      return sql(strings, ...values);
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Neon is not configured. Set DATABASE_URL.");
  }

  return async (strings, ...values) => {
    const { devQuery } = await import("./dev");
    const text = strings.reduce((query, part, index) => query + (index === 0 ? "" : `$${index}`) + part, "");
    return devQuery(text, values);
  };
}
