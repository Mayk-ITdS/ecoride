import db_pg from "../../db/postgres.js";

export async function getStatusIdMap(t = db_pg) {
  const rows = await t.any(`SELECT status, status_id FROM status_trajet`);
  return Object.fromEntries(rows.map((r) => [r.status, r.status_id]));
}

export function ensure(cond, msg = "Operation interdite") {
  if (!cond) throw new Error(msg);
}
