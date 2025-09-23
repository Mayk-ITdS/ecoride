import express from "express";
import UserController from "../controllers/UserController.js";
import { verifyToken } from "../middleware/authentication.js";
const router = express.Router();
router.use((req, res, next) => {
  console.log("userRoutes hit:", req.method, req.originalUrl);
  next();
});

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/preferences", UserController.updatePreferences);
router.get("/me", verifyToken, (req, res) => UserController.getMe(req, res));
router.put("/me", verifyToken, (req, res) => UserController.updateMe(req, res));

// // router.get("/profile", verifyToken, UserController.profile);

// // router.get("/user-dashboard", verifyToken, UserController.profile);
// // router.get(
// //   "/admin-dashboard",
// //   verifyToken,
// //   isRole("admin"),
// //   UserController.adminDashboard
// );

export default router;
