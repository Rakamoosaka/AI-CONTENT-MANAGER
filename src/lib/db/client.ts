import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

const globalDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

const sqlite =
  globalDb.sqlite ??
  new Database(process.env.DATABASE_URL?.replace("file:", "") ?? "sqlite.db");

const db = globalDb.db ?? drizzle(sqlite, { schema });

if (process.env.NODE_ENV !== "production") {
  globalDb.sqlite = sqlite;
  globalDb.db = db;
}

export { db };
