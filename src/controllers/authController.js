import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { sendVerificationCode } from "../services/emailService.js";
import {
  generateCode,
  saveCode,
  verifyEmailCode,
} from "../services/verificationService.js";
import { generateToken } from "../utils/jwt.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export const sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const code = generateCode();
    saveCode(email, code);

    await sendVerificationCode(email, code);

    return res.status(200).json({ message: "Verification code sent." });
  } catch (error) {
    console.error("Error sending code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  try {
    const { email, displayName, password, role, verificationCode } = req.body;

    // ✅ Verify code
    const isValid = verifyEmailCode(email, verificationCode);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    if (!email || !displayName || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      displayName,
      passwordHash: hash,
      role: role || "member",
      avatar: null,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        userID: newUser.userID,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password." });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Email not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successfully!",
      token,
      user: {
        userID: user.userID,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProfile = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { displayName, role, newEmail, verificationCode } = req.body;

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (newEmail && newEmail !== user.email) {
      const isValid = verifyEmailCode(newEmail, verificationCode);
      if (!isValid) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification code." });
      }

      const existingEmail = await User.findOne({ where: { email: newEmail } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use." });
      }

      user.email = newEmail;
    }

    if (req.file) {
      if (user.avatar && fs.existsSync(user.avatar)) {
        fs.unlinkSync(user.avatar);
      }

      const avatarPath = `uploads/${req.file.filename}`;
      user.avatar = avatarPath;
    }

    if (displayName) user.displayName = displayName;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        userID: user.userID,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar
          ? `${process.env.BASE_URL || "http://localhost:8080"}/${user.avatar}`
          : null,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
