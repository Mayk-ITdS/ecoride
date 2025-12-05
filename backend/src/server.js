import "dotenv/config";
import express from "express";
import cors from "cors";
import mongo from "../db/mongo.js";
import db_pg from "../db/postgres.js";
import makeReviewRouter from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import participationRoutes from "./routes/participationRoutes.js";
import trajetRoutes from "./routes/trajetRoutes.js";
import trajetStatusRouter from "./routes/trajetStatusRouter.js";
import userRoutes from "./routes/userRoutes.js";
import voitureRoutes from "./routes/voitureRoutes.js";
import rolesRouter from "./routes/rolesRouter.js";

const app = express();

app.disable("x-powered-by");
const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://ecoride-three.vercel.app",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req, _res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

await mongo.connect();
const passengerNotes = await mongo.collection("passenger_notes");
console.log("[server] namespace:", passengerNotes.namespace);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/debug/snapshot", async (_req, res, next) => {
  try {
    const col = passengerNotes;
    const mAll = await col.countDocuments();
    const mApproved = await col.countDocuments({
      visibility: "public",
      approved: true,
    });
    const [{ cnt_trajets } = { cnt_trajets: 0 }] = await db_pg.any(
      'SELECT COUNT(*)::int AS "cnt_trajets" FROM public.trajets'
    );
    const [{ cnt_status } = { cnt_status: 0 }] = await db_pg.any(
      'SELECT COUNT(*)::int AS "cnt_status" FROM public.status_trajet'
    );

    res.json({
      mongo: {
        db: mongo.getDb().databaseName,
        passenger_notes: { all: mAll, approved: mApproved },
      },
      postgres: {
        database: process.env.PGDATABASE || "(from URL)",
        trajets: cnt_trajets,
        status_trajet: cnt_status,
      },
    });
  } catch (e) {
    next(e);
  }
});

app.use("/api/reviews", makeReviewRouter(passengerNotes));

app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/participations", participationRoutes);
app.use("/api/trajets/status", trajetStatusRouter);
app.use("/api/users", userRoutes);
app.use("/api/voitures", voitureRoutes);
app.use("/api/roles", rolesRouter);
app.use("/api/trajets", trajetRoutes);

app.use((req, res) => res.status(404).json({ error: "Route non trouvée" }));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res
    .status(err.status || 500)
    .json({ error: err.status ? err.message : "Internal Server Error" });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`API listening on :${port}`));

export default app;
