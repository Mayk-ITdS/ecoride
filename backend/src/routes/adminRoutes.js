import express from "express";
import { verifyToken, isRole } from "../middleware/authentication.js";
import AdminController from "../controllers/AdminController.js";

const router = express.Router();

router.get("/metrics", verifyToken, isRole("admin"), (req, res) =>
  AdminController.getMetrics(req, res)
);

router.get("/users", verifyToken, isRole("admin"), (req, res) =>
  AdminController.listUsers(req, res)
);

router.patch(
  "/users/:userId/suspend",
  verifyToken,
  isRole("admin"),
  (req, res) => AdminController.setSuspended(req, res)
);

router.post("/employees", verifyToken, isRole("admin"), (req, res) =>
  AdminController.createEmployee(req, res)
);

export default router;
