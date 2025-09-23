// worker.js
import { Client as PgClient } from "pg";
import { MongoClient } from "mongodb";

const {
  PG_URI = "postgres://user:pass@localhost:5432/yourdb",
  MONGO_URI = "mongodb://localhost:27017",
  MONGO_DB = "ecorideMongo",
} = process.env;

const DEFAULT_PREFS = {
  allowSmoking: false,
  petFriendly: true,
  talkativeness: "normal",
  musicStyle: "various",
  maxPassengers: 3,
  luggageSize: "medium",
  pickupRadiusKm: 10.0,
  languages: ["fr"],
  blockedPassengers: [],
  notes: null,
};

async function ensureCollections(db) {
  try {
    await db.command({
      collMod: "driver_preferences",
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
            "active",
          ],
          properties: {
            driverId: { bsonType: "int" },
            active: { bsonType: "bool" },
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
            pickupRadiusKm: { bsonType: "double", minimum: 0, maximum: 200 },
            languages: {
              bsonType: "array",
              items: { bsonType: "string" },
              uniqueItems: true,
            },
            blockedPassengers: {
              bsonType: "array",
              items: { bsonType: "int" },
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
    try {
      await db.createCollection("driver_preferences");
    } catch {}
  }
  await db
    .collection("driver_preferences")
    .createIndex({ driverId: 1 }, { unique: true });
}

async function run() {
  const pg = new PgClient({ connectionString: PG_URI });
  const m = new MongoClient(MONGO_URI);
  await pg.connect();
  await m.connect();
  const db = m.db(MONGO_DB);
  await ensureCollections(db);
  const prefs = db.collection("driver_preferences");

  await pg.query("LISTEN driver_role");
  console.log("Listening on channel 'driver_role'…");

  pg.on("notification", async (msg) => {
    if (msg.channel !== "driver_role") return;
    try {
      const { user_id, op } = JSON.parse(msg.payload);
      const ts = new Date();
      if (op === "ADD") {
        await prefs.updateOne(
          { driverId: user_id },
          {
            $setOnInsert: { ...DEFAULT_PREFS, createdAt: ts },
            $set: { active: true, updatedAt: ts },
          },
          { upsert: true }
        );
        console.log(`driver ${user_id}: ACTIVE`);
      } else if (op === "REMOVE") {
        await prefs.updateOne(
          { driverId: user_id },
          { $set: { active: false, updatedAt: ts } },
          { upsert: true }
        );
        console.log(`driver ${user_id}: INACTIVE`);
      }
    } catch (e) {
      console.error("handler error:", e, "payload:", msg.payload);
    }
  });

  process.on("SIGINT", async () => {
    await pg.end();
    await m.close();
    process.exit(0);
  });
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
