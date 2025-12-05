import pgPromise from "pg-promise";

const pgp = pgPromise();

const hasDatabaseUrl = !!process.env.DATABASE_URL;

let db_pg;

if (hasDatabaseUrl) {
  const connectionString = process.env.DATABASE_URL;
  db_pg = pgp({
    connectionString,
    ssl:
      connectionString && connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
  });
  console.log("[db_pg] Using DATABASE_URL for Postgres connection");
} else {
  db_pg = pgp({
    host: process.env.PG_HOST || "localhost",
    port: Number(process.env.PG_PORT) || 5432,
    database: process.env.PG_DB || "ecoride_db",
    user: process.env.PG_USER || "ecoride",
    password: process.env.PG_PASSWORD || "root",
  });

  console.log(
    "[db_pg] Using PG_* env vars / localhost for Postgres connection"
  );
}

export default db_pg;
