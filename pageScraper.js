const scraperObject = {
  url: "https://www.qualibat.com/resultat-de-la-recherche/",

  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    let scrapedData = [];
    async function scrapeCurrentPage() {
      await page.waitForSelector(".blockcontainer-inner");
      await page.waitForSelector(".right-particulier-formblock");
      await page.waitForSelector(".insideblock");
      await page.waitForSelector(".form-result-search"); 
      let urls = await page.$$eval("table tbody > tr", (links) => {
        links = links.map((el) => el.querySelector("td > a").href);
        return links;
      });

      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let dataObj = {};
          let newPage = await browser.newPage();
          await newPage.goto(link);

          dataObj["nom entreprise"] = await newPage.$eval(
            ".right-particulier-formblock > .titleblock >  p > strong",
            (text) => text.textContent
          );
          dataObj["Adresse"] = await newPage.$eval(
            ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(6) > p:nth-of-type(1)",
            (text) => text.textContent.slice(10)
          );
          dataObj["CP"] = "not found";
          dataObj["Telephone"] = await newPage.$eval(
            ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(6) > p:nth-of-type(2)",
            (text) => text.textContent.slice(13)
          );
          dataObj["Email"] = await newPage.$eval(
            ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(6) > p:nth-of-type(3)",
            (text) => text.textContent.slice(7)
          );
          dataObj["Nb chantiers"] = "not found";
          dataObj["Code client"] = "not found";
          dataObj["Siren"] = await newPage.$eval(
            ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(2) > p:nth-of-type(1)",
            (text) => text.textContent.slice(0, -4)
          );
          dataObj["Siret"] = await newPage.$eval(
            ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(2) > p:nth-of-type(1)",
            (text) => text.textContent
          );
          dataObj["APE"] = "not found";
          dataObj["Effectif"] = await newPage.$eval(
            ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(5) > p:nth-of-type(1)",
            (text) => text.textContent
          );

          resolve(dataObj);

          await newPage.close();
        });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        scrapedData.push(currentPageData);
      }
      let nextButtonExist = false;
      try {
        const nextButton = await page.$eval(
          ".right-particulier-formblock  > .insideblock  > div > .form-result-search > .dataTables_wrapper > .dataTables_paginate > span.next",
          (span) => span.textContent
        );
        nextButtonExist = true;
      } catch (err) {
        nextButtonExist = false;
      }
      console.log("next button", nextButtonExist);
      if (nextButtonExist) {
        await page.click(
          ".right-particulier-formblock  > .insideblock  > div > .form-result-search > .dataTables_wrapper > .dataTables_paginate > span.next"
        );
        return scrapeCurrentPage(); 
      }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log(data);
    return data;
  },
};

module.exports = scraperObject;
