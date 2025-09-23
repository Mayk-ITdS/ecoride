// migrate.js
import { Client as PgClient } from "pg";
import { MongoClient } from "mongodb";

const {
  PG_URI = "postgres://user:pass@localhost:5432/yourdb",
  MONGO_URI = "mongodb://localhost:27017",
  MONGO_DB = "ecorideMongo",
  BATCH = "5000",
} = process.env;

const BATCH_SIZE = parseInt(BATCH, 10);

// Kierowcy: z roli + z trajets, bez NULL-i
const DRIVERS_SQL = `
WITH drivers AS (
  SELECT DISTINCT u.id_user
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id_user
  JOIN roles r       ON r.role_id = ur.role_id
  WHERE r.nom IN ('chauffeur','driver')

  UNION

  SELECT DISTINCT t.id_chauffeur AS id_user
  FROM trajets t
  WHERE t.id_chauffeur IS NOT NULL
)
SELECT id_user
FROM drivers
WHERE id_user IS NOT NULL
ORDER BY id_user
OFFSET $1 LIMIT $2;
`;

async function ensureCollections(db) {
  // driver_preferences: jeśli nie istnieje, utwórz (walidator toleruje int/long/double dla pickupRadiusKm)
  try {
    await db.createCollection("driver_preferences", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "driverId",
            "createdAt",
            "updatedAt",
            "allowSmoking",
            "petFriendly",
            "talkativeness",
            "musicStyle",
            "maxPassengers",
            "luggageSize",
            "pickupRadiusKm",
          ],
          properties: {
            driverId: { bsonType: ["int", "long"] },
            allowSmoking: { bsonType: "bool" },
            petFriendly: { bsonType: "bool" },
            talkativeness: { enum: ["silent", "normal", "chatty"] },
            musicStyle: {
              enum: [
                "none",
                "pop",
                "rock",
                "electronic",
                "classical",
                "talk_radio",
                "various",
              ],
            },
            maxPassengers: { bsonType: "int", minimum: 1, maximum: 8 },
            luggageSize: { enum: ["none", "small", "medium", "large"] },
            pickupRadiusKm: {
              bsonType: ["double", "int", "long"],
              minimum: 0,
              maximum: 200,
            },
            languages: {
              bsonType: "array",
              items: { bsonType: "string" },
              uniqueItems: true,
            },
            blockedPassengers: {
              bsonType: "array",
              items: { bsonType: ["int", "long"] },
              uniqueItems: true,
            },
            notes: { bsonType: ["string", "null"], maxLength: 500 },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
      validationLevel: "strict",
    });
  } catch (_) {
    /* już istnieje – ok */
  }

  await db
    .collection("driver_preferences")
    .createIndex({ driverId: 1 }, { unique: true });

  // passenger_notes: tworzymy jeśli brak (bez seedów)
  try {
    await db.createCollection("passenger_notes", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "passengerId",
            "driverId",
            "title",
            "message",
            "category",
            "visibility",
            "createdAt",
          ],
          properties: {
            passengerId: { bsonType: ["int", "long"] },
            driverId: { bsonType: ["int", "long"] },
            rideId: { bsonType: ["int", "long", "null"] },
            title: { bsonType: "string", minLength: 1, maxLength: 120 },
            message: { bsonType: "string", minLength: 1, maxLength: 2000 },
            category: {
              enum: [
                "punctuality",
                "cleanliness",
                "behavior",
                "payment",
                "communication",
                "other",
              ],
            },
            visibility: { enum: ["private", "ops_only"] },
            tags: {
              bsonType: "array",
              items: { bsonType: "string" },
              uniqueItems: true,
            },
            rating: {
              bsonType: ["int", "long", "null"],
              minimum: 1,
              maximum: 5,
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
      validationLevel: "strict",
    });
  } catch (_) {
    /* już istnieje – ok */
  }
}

async function main() {
  const pg = new PgClient({ connectionString: PG_URI });
  const m = new MongoClient(MONGO_URI);

  await pg.connect();
  await m.connect();
  const db = m.db(MONGO_DB);
  await ensureCollections(db);

  const col = db.collection("driver_preferences");

  let offset = 0;
  let processed = 0;

  for (;;) {
    const { rows } = await pg.query(DRIVERS_SQL, [offset, BATCH_SIZE]);
    if (!rows.length) break;

    // Zamień na inty i odfiltruj śmieci
    const ids = rows
      .map((r) =>
        typeof r.id_user === "number" ? r.id_user : parseInt(r.id_user, 10)
      )
      .filter((n) => Number.isInteger(n));

    if (ids.length === 0) {
      // nic do zrobienia w tej partii
      offset += rows.length;
      continue;
    }

    const ts = new Date();
    const DEFAULTS = {
      allowSmoking: false,
      petFriendly: true,
      talkativeness: "normal",
      musicStyle: "various",
      maxPassengers: 3,
      luggageSize: "medium",
      pickupRadiusKm: 10, // int/double – validator już akceptuje oba
      languages: ["fr"],
      blockedPassengers: [],
      notes: null,
      createdAt: ts,
    };

    const ops = ids.map((id) => ({
      updateOne: {
        filter: { driverId: id },
        update: {
          $setOnInsert: DEFAULTS,
          $set: { updatedAt: ts },
        },
        upsert: true,
      },
    }));

    const r = await col.bulkWrite(ops, { ordered: false });
    processed += ids.length;
    console.log(
      `batch ok: upserted=${r.upsertedCount}, matched=${r.matchedCount}, modified=${r.modifiedCount}`
    );

    offset += rows.length;
  }

  console.log(`DONE. drivers processed: ${processed}`);
  await pg.end();
  await m.close();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
