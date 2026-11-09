import fs from "node:fs";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { Row } from "./index";

// Banco local apenas para desenvolvimento (nunca usado quando DATABASE_URL existe).
const globalForDb = globalThis as unknown as { __maysaDevDb?: Promise<PGlite> };

async function open() {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = path.join(process.cwd(), ".data", "dev-db");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(dataDir);
  const migrationsDir = path.join(process.cwd(), "neon", "migrations");
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) await db.exec(fs.readFileSync(path.join(migrationsDir, file), "utf8"));
  return db;
}

export async function devQuery(text: string, values: unknown[]): Promise<Row[]> {
  globalForDb.__maysaDevDb ??= open();
  const db = await globalForDb.__maysaDevDb;
  const result = await db.query<Row>(text, values);
  return result.rows;
}
