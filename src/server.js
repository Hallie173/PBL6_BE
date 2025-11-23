// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import aiRoutes from "./routes/aiRoutes.js";
import alertsRoutes from "./routes/alertsRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import { sequelize } from "./models/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTION"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options(/.*/, cors());

app.use("/uploads", express.static("uploads"));

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api", apiRoutes);
app.use("/api", aiRoutes);
app.use("/api", alertsRoutes);
app.use("/api", evidenceRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");

    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
