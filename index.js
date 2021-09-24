const express = require("express");
const app = express();
const port = 8090;
const browserObject = require("./browser");
const scraperController = require("./pageController");

app.get("/upload/:family", (req, res) => {
  const { family } = req.params;
  const familySplitted = family.split('_')
  if (family !== undefined) {
    let browserInstance = browserObject.startBrowser();
    scraperController(browserInstance, familySplitted);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
