import express from "express";
import { findTrajets, getTrajetById } from "../trajet/trajetController.js";

const router = express.Router();
router.get("/", findTrajets);
router.get("/:id", getTrajetById);

export default router;
