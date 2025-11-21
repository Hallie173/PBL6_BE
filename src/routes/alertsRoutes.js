// src/routes/alertsRoutes.js

import express from "express";
import alertController from "../controllers/alertController.js";
import alertManager from "../controllers/alertManager.js";

const router = express.Router();

router.post("/alerts/receive", alertController.receiveAlert);

router.post("/:id/snapshot", alertController.uploadSnapshot);

router.post("/detect", alertManager.handleDetectionEvent);

router.get("/:id", alertController.getAlert);

export default router;
