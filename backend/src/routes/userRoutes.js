import express from "express";
import UserController from "../user/userController.js";
import { verifyToken, isRole } from "../middleware/authentication.js";

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);

// // router.get("/profile", verifyToken, UserController.profile);

// // router.get("/user-dashboard", verifyToken, UserController.profile);
// // router.get(
// //   "/admin-dashboard",
// //   verifyToken,
// //   isRole("admin"),
// //   UserController.adminDashboard
// );

export default router;
