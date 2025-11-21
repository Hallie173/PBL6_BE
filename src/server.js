// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import aiRoutes from "./routes/aiRoutes.js";
import alertsRoutes from "./routes/alertsRoutes.js";
import { sequelize } from "./models/index.js"; // ⭐ DÙNG CHUẨN
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

// ---- FIX OPTIONS WILDCARD ----
app.options(/.*/, cors());
// ------------------------------

app.use("/uploads", express.static("uploads"));

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));

// Routes
app.use("/api", apiRoutes);
app.use("/api", aiRoutes);
app.use("/api", alertsRoutes);

// Start server sau khi DB OK
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");

    return sequelize.sync(); // ⭐ đảm bảo bảng Alert / AlertRecipient tồn tại
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
