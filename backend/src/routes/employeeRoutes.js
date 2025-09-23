import express from "express";
import { verifyToken, isRole } from "../middleware/authentication.js";
import EmployeeController from "../controllers/EmployeeController.js";

const router = express.Router();

router.get(
  "/reviews/pending",
  verifyToken,
  isRole("employee", "admin"),
  (req, res) => EmployeeController.getPendingReviews(req, res)
);

router.patch(
  "/reviews/:id/approve",
  verifyToken,
  isRole("employee", "admin"),
  (req, res) => EmployeeController.approveReview(req, res)
);

router.patch(
  "/reviews/:id/reject",
  verifyToken,
  isRole("employee", "admin"),
  (req, res) => EmployeeController.rejectReview(req, res)
);
router.get("/incidents", verifyToken, isRole("employee", "admin"), (req, res) =>
  EmployeeController.getIncidents(req, res)
);

export default router;
