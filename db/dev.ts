import fs from "node:fs";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { Row } from "./index";
import { schemaStatements } from "./schema";

// Banco local apenas para desenvolvimento (nunca usado quando DATABASE_URL existe).
const globalForDb = globalThis as unknown as { __maysaDevDb?: Promise<PGlite> };

async function open() {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = path.join(process.cwd(), ".data", "dev-db");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(dataDir);
  for (const statement of schemaStatements) await db.exec(statement);
  return db;
}

export async function devQuery(text: string, values: unknown[]): Promise<Row[]> {
  globalForDb.__maysaDevDb ??= open();
  const db = await globalForDb.__maysaDevDb;
  const result = await db.query<Row>(text, values);
  return result.rows;
}
