const getHomepage = (req, res) => {
  res.send("Hello World! I am Hallie! This is my first Express App.");
};

const getAuthorName = (req, res) => {
  res.render("sample.ejs");
};

module.exports = {
  getHomepage,
  getAuthorName,
};
