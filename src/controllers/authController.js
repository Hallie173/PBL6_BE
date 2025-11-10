import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

export const signup = async (req, res) => {
  try {
    const { email, displayName, password, role, avatar } = req.body;

    if (!email || !displayName || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      displayName,
      passwordHash: hashedPassword,
      role: role || "member",
      avatar: avatar || null,
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        userID: newUser.userID,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
