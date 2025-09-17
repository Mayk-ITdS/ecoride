import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const pgp = pgPromise();

const db_pg = pgp({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DB || "ecoride_db",
  user: process.env.PG_USER || "ecoride",
  password: process.env.PG_PASSWORD || "root",
});

export default db_pg;
