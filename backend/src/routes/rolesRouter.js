import express from "express";
import { verifyToken } from "../middleware/authentication.js";
import { getMyRoles, setMyRole } from "../controllers/RoleController.js";

const router = express.Router();
router.get("/me", verifyToken, getMyRoles);
router.patch("/me", verifyToken, setMyRole);
export default router;
