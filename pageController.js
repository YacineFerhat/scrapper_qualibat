const pageScraper = require("./pageScraper");
const fs = require("fs");

const familyNumber = [
  11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 27, 31, 32, 33, 34, 35, 37, 38, 39,
  41, 42, 43, 44, 45, 47, 51, 52, 53, 54, 55, 59, 61, 62, 63, 65, 66, 71, 72,
  73, 86, 87, 91,
];

async function scrapeAll(browserInstance) {
  let browser;
  try {
    for (let indexF = 0; indexF < familyNumber.length; indexF++) {
      for (let departement = 1; departement < 96; departement++) {
        browser = await browserInstance;
        let scrapedData = await pageScraper.scraper(
          browser,
          familyNumber[indexF],
          departement
        );
      }
    }
    /*fs.writeFile(
      "data.json",
      JSON.stringify(scrapedData),
      "utf8",
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          "The data has been scraped and saved successfully! View it at './data.json'"
        );
      }
    );*/
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
