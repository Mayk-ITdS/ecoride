import express from "express";
import trajetRoutes from "./routes/trajetRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/trajets", trajetRoutes);
app.use("/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
