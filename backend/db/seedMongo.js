import "dotenv/config";
import pg from "pg-promise";
import { MongoClient } from "mongodb";

const pgp = pg();
const db = pgp(process.env.DATABASE_URL);

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017";
const MONGO_DB =
  process.env.MONGODB_DB || process.env.MONGO_DB || "ecorideMongo";

const client = new MongoClient(MONGO_URI, { maxPoolSize: 10 });

const DEFAULT_PREFS = {
  fumer: false,
  pets: true,
  music: "medium",
  chatty: "medium",
  silence: false,
  luggage: true,
};

(async () => {
  try {
    const users = await db.any(`
      SELECT u.id_user, u.pseudo, u.email,
             ARRAY_AGG(r.nom ORDER BY r.role_id) AS roles
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id_user
      JOIN roles r       ON r.role_id = ur.role_id
      GROUP BY u.id_user, u.pseudo, u.email
      ORDER BY u.id_user
    `);

    console.log("[seed] users:", users.length);

    await client.connect();
    const mdb = client.db(MONGO_DB);
    const prefsCol = mdb.collection("preferences");
    const notesCol = mdb.collection("passenger_notes");

    await prefsCol.createIndex({ id_user: 1 }, { unique: true });

    const now = new Date();
    let upserts = 0;

    for (const u of users) {
      const p = { ...DEFAULT_PREFS };
      if (u.roles.includes("chauffeur")) {
        p.music = "low";
        p.chatty = "low";
      }
      await prefsCol.updateOne(
        { id_user: u.id_user },
        {
          $setOnInsert: { createdAt: now },
          $set: { updatedAt: now, preferences: p },
        },
        { upsert: true }
      );
      upserts++;
    }
    console.log(`[seed] preferences upserts: ${upserts}`);

    const someDrivers = users
      .filter((u) => u.roles.includes("chauffeur"))
      .slice(0, 3);
    for (const d of someDrivers) {
      await notesCol.insertOne({
        passengerId: 202,
        driverId: d.id_user,
        title: "Trajet de test",
        message: "Très bien.",
        category: "communication",
        visibility: "public",
        rating: 4,
        publicName: "SeedBot",
        location: "Paris",
        tags: ["seed"],
        createdAt: new Date(),
        updatedAt: new Date(),
        approved: true,
      });
    }
    console.log(
      `[seed] passenger_notes added for ${someDrivers.length} drivers`
    );

    console.log("[seed] DONE");
  } catch (e) {
    console.error("[seed] error:", e);
    process.exit(1);
  } finally {
    try {
      await client.close();
    } catch {}
    try {
      await db.$pool.end();
    } catch {}
  }
})();
