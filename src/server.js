import express from "express";
import bodyParser from "body-parser";
import apiRoutes from "./routes/api.js";
import sequelize from "./config/database.js";

sequelize.sync({ alter: true }).then(() => {
  console.log("All models were synchronized successfully.");
});

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

sequelize.sync().then(() => {
  console.log("Database connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
