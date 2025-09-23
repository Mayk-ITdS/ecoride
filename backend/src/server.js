import express from "express";
import cors from "cors";
import mongo from "../db/mongo.js";
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
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

await mongo.connect();

const passengerNotes = await mongo.collection("passenger_notes");
app.use("/reviews", makeReviewRouter(passengerNotes));
console.log("[server] namespace:", passengerNotes.namespace);

// reszta tras
app.use("/admin", adminRoutes);
app.use("/employee", employeeRoutes);
app.use("/participations", participationRoutes);
app.use("/trajets", trajetRoutes);
app.use("/trajets/status", trajetStatusRouter);
app.use("/users", userRoutes);
app.use("/voitures", voitureRoutes);
app.use("/roles", rolesRouter);
// 404 i błąd

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: "Route non trouvée" }));
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.status ? err.message : "Internal Server Error" });
});

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
export default app;
