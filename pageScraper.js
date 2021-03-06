const scraperObject = {
  url: "https://www.qualibat.com/maitre-douvrage/",
  async scraper(browser, family, departement) {
    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    console.log(
      `in process : family ${family}, departement ${departement} ...`
    );
    await page.goto(this.url, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });

    await page.waitForSelector(".blockcontainer-inner");
    await page.type(
      ".formblock > .insideblock >  .form-entreprise > .halfblockleft   > .liste-qualif > .numeric > .fast-numeric",
      family.toString()
    );
    await page.type(
      ".formblock > .insideblock >  .form-entreprise > .halfblockright  > .second-part > .column > .dep > .select2 > .selection > .select2-selection > .select2-selection__rendered > .select2-search > .select2-search__field",
      departement.toString()
    );
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
    try {
      await page.click("#tarteaucitronPersonalize2");
    } catch (err) {}
    await page.waitForTimeout(3000);
    await page.click(
      ".formblock > .insideblock >  .form-entreprise > .halfblockright  > .btn-more "
    );

    let scrapedData = [];
    async function scrapeCurrentPage() {
      try {
        await page.waitForSelector(".blockcontainer-inner");
        await page.waitForSelector(".right-particulier-formblock");
        await page.waitForSelector(".insideblock");
        await page.waitForSelector(".form-result-search");
      } catch (err) {}
      let urls = await page.$$eval("table tbody > tr", (links) => {
        links = links.map((el) => el.querySelector("td > a").href);
        return links;
      });

      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let dataObj = {};
          let newPage = await browser.newPage();
          await newPage.goto(link);

          try {
            dataObj["Nom entreprise"] = await newPage.$eval(
              ".right-particulier-formblock > .titleblock >  p > strong",
              (text) => text.textContent
            );
          } catch (err) {
            dataObj["Nom entreprise"] = "Not found";
          }

          dataObj["Site web"] = link;

          try {
            dataObj["Adresse"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(6) > p:nth-of-type(1)",
              (text) => text.textContent.slice(10)
            );
          } catch (err) {
            dataObj["Adresse"] = "Not found";
          }

          try {
            dataObj["Telephone"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(6) > p:nth-of-type(2)",
              (text) =>
                text.textContent
                  .slice(13)
                  .replace(" ", "")
                  .replace(" ", "")
                  .replace(" ", "")
                  .replace(" ", "")
            );
          } catch (err) {
            dataObj["Telephone"] = "Not found";
          }

          try {
            dataObj["Email"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(6) > p:nth-of-type(3)",
              (text) => text.textContent.slice(7)
            );
          } catch (err) {
            dataObj["Email"] = "Not found";
          }

          try {
            dataObj["Siren"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(2) > p:nth-of-type(1)",
              (text) => text.textContent.slice(0, -4)
            );
          } catch (err) {
            dataObj["Siren"] = "Not found";
          }

          try {
            dataObj["Siret"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(2) > p:nth-of-type(1)",
              (text) => text.textContent
            );
          } catch (err) {
            dataObj["Siret"] = "Not found";
          }

          try {
            dataObj["Dirigeant"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(1) > p:nth-of-type(1)",
              (text) => text.textContent
            );
          } catch (err) {
            dataObj["Dirigeant"] = "Not found";
          }

          try {
            dataObj["Date de cr??ation"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(3) > p:nth-of-type(1)",
              (text) => text.textContent
            );
          } catch (err) {
            dataObj["Date de cr??ation"] = "Not found";
          }

          try {
            dataObj["Effectif"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(5) > p:nth-of-type(1)",
              (text) => text.textContent.slice(0, -9)
            );
          } catch (err) {
            dataObj["Effectif"] = "Not found";
          }

          try {
            dataObj["Chiffre d'affaires"] = await newPage.$eval(
              ".right-particulier-formblock > .insideblock > div > .account-single > .left-col > div.block:nth-of-type(4) > p:nth-of-type(1)",
              (text) => {
                let isMilion = text.textContent.includes("millions euros")
                  ? true
                  : false;
                let textToShow = isMilion
                  ? text.textContent.slice(0, -14)
                  : text.textContent.slice(0, -6);
                let textWithoutComma = textToShow;
                textWithoutComma = isMilion
                  ? parseFloat(textWithoutComma.replace(",", ".")) * 1000000
                  : parseFloat(textWithoutComma.replace(" ", ""));
                return textWithoutComma;
              }
            );
          } catch (err) {
            dataObj["Chiffre d'affaires"] = "Not found";
          }

          dataObj["Groupe"] = family;

          dataObj["D??partement"] = departement;
          resolve(dataObj);

          await newPage.close();
        });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        scrapedData.push(currentPageData);
      }
      let nextButtonExist = false;
      let disabled = true;
      try {
        await page.waitForSelector(
          ".right-particulier-formblock  > .insideblock  > div > .form-result-search > .dataTables_wrapper > .dataTables_paginate",
          {
            visible: true,
          }
        );
        disabled = await page.$(
          ".right-particulier-formblock  > .insideblock  > div > .form-result-search > .dataTables_wrapper > .dataTables_paginate > span.disabled:nth-of-type(5) "
        );
        nextButtonExist = disabled ? false : true;
      } catch (err) {
        nextButtonExist = false;
      }
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
    return data;
  },
};

module.exports = scraperObject;
