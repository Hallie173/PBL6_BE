import express from "express";
import { sendCode, signup, login } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/send-verification-code", sendCode);
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected profile route.", user: req.user });
});

export default router;
