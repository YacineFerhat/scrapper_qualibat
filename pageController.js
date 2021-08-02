const { Parser } = require("json2csv");
const pageScraper = require("./pageScraper");
const imageController = require("./utils/uploadFile");

const familyNumber = [
  11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 27, 31, 32, 33, 34, 35, 37, 38, 39,
  41, 42, 43, 44, 45, 47, 51, 52, 53, 54, 55, 59, 61, 62, 63, 65, 66, 71, 72,
  73, 86, 87, 91,
];

const fields = [
  "Nom entreprise",
  "Site web",
  "Adresse",
  "Telephone",
  "Email",
  "Siren",
  "Siret",
  "Effectif",
  "Chiffre d'affaires",
  "Groupe",
  "Département",
];

async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    for (let indexF = 0; indexF < familyNumber.length; indexF++) {
      for (let departement = 1; departement < 96; departement++) {
        let scrapedData = await pageScraper.scraper(
          browser,
          familyNumber[indexF],
          departement
        );
        try {
          const parser = new Parser({
            fields,
          });
          const csv = parser.parse(scrapedData);
          const fileName = `Groupe-${familyNumber[indexF]}-Departement-${departement}`;
          const result = await imageController.saveImage(csv, fileName);
          console.log(result);
        } catch (err) {
          console.error("couldn't save the csv file", err);
        }
      }
    }
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
