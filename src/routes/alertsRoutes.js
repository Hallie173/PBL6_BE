// src/routes/alertsRoutes.js

import express from "express";
import { authMiddleware } from "../controllers/authController.js";
import * as alertController from "../controllers/alertController.js";

const router = express.Router();

router.post("/receive", authMiddleware, alertController.receiveAlert);
router.post("/:id/snapshot", alertController.uploadSnapshot);

export default router;
