import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { Row } from "./index";
import { schemaStatements } from "./schema";

// Banco local apenas para desenvolvimento (nunca usado quando DATABASE_URL existe).
const globalForDb = globalThis as unknown as { __maysaDevDb?: Promise<PGlite> };

/**
 * Fica FORA da pasta do projeto: pastas sincronizadas (OneDrive, Dropbox...)
 * travam os arquivos do Postgres e impedem o banco de reabrir.
 * Pode ser trocado com a variável DEV_DB_DIR.
 */
export function devDbDir() {
  if (process.env.DEV_DB_DIR) return process.env.DEV_DB_DIR;
  const base = process.platform === "win32" ? process.env.LOCALAPPDATA || os.homedir() : path.join(os.homedir(), ".cache");
  return path.join(base, "maysa-braids", "dev-db");
}

async function open() {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = devDbDir();
  fs.mkdirSync(dataDir, { recursive: true });
  const db = await PGlite.create(dataDir);
  for (const statement of schemaStatements) await db.exec(statement);
  return db;
}

export async function devQuery(text: string, values: unknown[]): Promise<Row[]> {
  globalForDb.__maysaDevDb ??= open().catch((error) => {
    globalForDb.__maysaDevDb = undefined; // tenta de novo na próxima requisição
    console.error(`Banco local de desenvolvimento não abriu (${devDbDir()}). Se persistir, apague essa pasta.`);
    throw error;
  });
  const db = await globalForDb.__maysaDevDb;
  const result = await db.query<Row>(text, values);
  return result.rows;
}
