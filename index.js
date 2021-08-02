const express = require('express')
const app = express()
const port = 8080
const browserObject = require("./browser");
const scraperController = require("./pageController");

app.get('/', (req, res) => {
  let browserInstance = browserObject.startBrowser();
  scraperController(browserInstance);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})




