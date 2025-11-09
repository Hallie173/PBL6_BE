require("dotenv").config();

const express = require("express");
const configViewEngine = require("./config/viewEngine");
const webRoutes = require("./routes/web");

const mysql = require("mysql2");

const app = express();
const port = process.env.PORT || 8081;
const hostname = process.env.HOST_NAME;

//config view engine
configViewEngine(app);

app.use("/test", webRoutes);

//test connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "123456",
  database: "pbl6_db",
});

connection.query("SELECT * FROM Users u", function (err, results, fields) {
  console.log(">>>results: ", results);
  console.log(">>>fields: ", fields);
});

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`);
});
