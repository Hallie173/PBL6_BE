const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World! I am Hallie! This is my first Express App.");
});

router.get("/halliepage", (req, res) => {
  //res.send("Hello World! I am Hallie!");
  res.render("sample.ejs");
});

module.exports = router;