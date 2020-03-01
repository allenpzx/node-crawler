const puppeteer = require("puppeteer");
const fs = require("fs");
import xlsx from "node-xlsx";
import { get as _get } from "lodash";

const nextPage = async page => {
  try {
    if(page.isClosed()) return
    await page.evaluate(() => {
      window.scrollTo({ left: 0, top: document.body.scrollHeight });
    });
    await page.waitFor(5000);
    if(page.isClosed()) return
    const handle_path =
      "[class^=ember-view] [class^=artdeco-pagination] [aria-label=Next]";
    await page.waitFor(handle_path);
    await page.click(handle_path);
    await page.waitForNavigation();
  } catch (e) {
    console.log("nextPage: ", e);
    return Promise.reject(e);
  }
};

const LinkedInCrawler = async function() {
  try {
    console.log("linkedin crawl start");
    console.time("used time");
    let result = [];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let pageInfo = {
      total: 0
    };
    let interceptor: any = () => {};

    await new Promise(async (resolve, reject) => {
      interceptor = async response => {
        try {
          const url = response.url();
          const target = url.indexOf("/voyager/api/search/blended") > -1;
          if (target) {
            const data = await response.json();
            const total = _get(data, "data.paging.total");
            pageInfo.total = total;
            const out_list = _get(data, "data.elements");
            const list = out_list.reduce((prev, curr) =>  curr.elements ? prev.concat(curr.elements) : prev, []);
            result = result.concat(list);

            if (result.length >= 100) return resolve();

            await nextPage(page);
          }
        } catch (e) {
          console.log("interceptor: ", e);
        }
      };

      await page.on("response", interceptor);

      // login
      await page.goto("https://www.linkedin.com/uas/login");
      await page.type(
        ".form__input--floating #username",
        ""
      );
      await page.type(".form__input--floating #password", "");
      await page.click(".login__form_action_container button");

      // search
      await page.waitFor("[class^=search-global-typeahead__input]");
      await page.type(
        "[class^=search-global-typeahead__input]",
        ""
      );
      await page.click("[class^=search-global-typeahead__button");
      await page.waitFor("[class^=search-results__total]");

      // checkout people type
      await page.waitFor(
        "[class^=search-vertical-filter__filter] li:nth-of-type(1) button"
      );
      await page.click(
        "[class^=search-vertical-filter__filter] li:nth-of-type(1) button"
      );
      await page.waitFor("[class^=search-results__total]");
      await page.waitForNavigation();
    });

    console.log("finished!", result.length);
    console.timeEnd("used time");
    const format_result = result.map(v => ({
      name: _get(v, "title.text"),
      job: _get(v, "headline.text"),
      location: _get(v, "subline.text"),
      url: _get(v, "navigationUrl")
    }));
    let arr = [["name", "job", "location", "url"]];
    format_result.map(v => arr.push([v.name, v.job, v.location, v.url]));
    let excel = [
      {
        name: "test",
        data: arr
      }
    ];

    var buffer = xlsx.build(excel);
    await fs.writeFile("./result.xlsx", buffer, function(err) {
      if (err) throw err;
      console.log("Write to xls has finished");
    });

    page.removeListener("request", interceptor);
    await page.close();
    await browser.close();
    return format_result;
  } catch (e) {
    console.log("LinkedInCrawler: ", e);
    return Promise.reject(e);
  }
};

export default LinkedInCrawler;
