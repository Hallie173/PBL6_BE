const express = require("express");
const { getHomepage, getAuthorName } = require("../controllers/homeController");
const router = express.Router();

router.get("/", getHomepage);
router.get("/halliepage", getAuthorName);

module.exports = router;
