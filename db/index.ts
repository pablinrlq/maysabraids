import { neon } from "@neondatabase/serverless";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

/**
 * Em produção usa o Neon (DATABASE_URL). Em desenvolvimento, se DATABASE_URL não
 * estiver definida, cai num Postgres local embutido (PGlite, pasta .data/) para
 * que `npm run dev` funcione sem nenhuma configuração.
 */
export function getSql(): Sql {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) return neon(databaseUrl) as unknown as Sql;

  if (process.env.NODE_ENV === "production") {
    throw new Error("Neon is not configured. Set DATABASE_URL.");
  }

  return async (strings, ...values) => {
    const { devQuery } = await import("./dev");
    const text = strings.reduce((query, part, index) => query + (index === 0 ? "" : `$${index}`) + part, "");
    return devQuery(text, values);
  };
}
