const puppeteer = require("puppeteer");
const URL = require("url");
import { get as _get } from "lodash";
import {
  isLoginPage,
  Login,
  closeModal,
  getMileageNumber,
  getMileageUnit,
  getPriceSymble,
  getPriceNumber
} from "./util";

interface ICar {
  year: string;
  make: string;
  model: string;
  trim: string;
  vehicle_id: string;
  odometer: string;
  odometer_unit: string;
  current_price: string;
  currency: string;
}

interface IResult {
  section: string;
  url: string;
  matching_results: number;
  listing: ICar[];
}

const resultInit: IResult = {
  url: "",
  matching_results: 0,
  listing: [],
  section: ""
};

const nextPage = async page => {
  try {
    const handle_path = `[class^=listResultsContainer] [class^=auctionItemsList] [class^=pagination] > a:nth-of-type(2)`;
    await page.waitFor(handle_path);
    await page.click(handle_path);
  } catch (e) {
    console.log("nextPage: ", e);
    return Promise.reject(e);
  }
};

const EBlockListCrawler = async function() {
  try {
    console.log("eblock list crawl start");
    console.time("used time");
    let result: IResult = resultInit;
    const runlist_url = `https://app.eblock.com/buy/run-list?distance=500&id=5e061b64-51d0-42c5-9103-6239e41a78af&mileageLTE=105780&savedSearchId=a195a720-5a2a-46ad-91ac-018f862484a3&yearGTE=2013`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let pageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
      totalEdges: 0,
      endCursor: "",
      startCursor: ""
    };
    let interceptor: any = () => {};

    await new Promise(async (resolve, reject) => {
      interceptor = async response => {
        try {
          const url = response.url();
          const ct = response.headers()["content-type"];
          const target =
            url.indexOf("/graphql") > -1 &&
            ct &&
            ct.startsWith("application/json");
          if (target) {
            const data = await response.json();
            const _pageInfo = _get(data, "data.auctionItemConnection.pageInfo");
            if (!_pageInfo) return;
            pageInfo = { ..._pageInfo };
            const edges = _get(data, "data.auctionItemConnection.edges", []);
            const listing = edges.map(v => ({
              year: _get(v, "node.inventoryItem.year", ""),
              make: _get(v, "node.inventoryItem.make", ""),
              model: _get(v, "node.inventoryItem.model", ""),
              trim: _get(v, "node.inventoryItem.trim", ""),
              vehicle_id: _get(v, "node.inventoryItem.id", ""),
              odometer: getMileageNumber(
                _get(v, "node.inventoryItem.mileage.formattedAmount", "")
              ),
              odometer_unit: getMileageUnit(
                _get(v, "node.inventoryItem.mileage.formattedAmount", "")
              ),
              current_price: getPriceNumber(
                _get(v, "node.nextBidIncrement.formattedAmountRounded", "")
              ),
              currency: getPriceSymble(
                _get(v, "node.listPrice.formattedAmountRounded", "")
              )
            }));

            result.listing = result.listing.concat(listing);
            result.matching_results = _get(pageInfo, "totalEdges", 0);
            if (pageInfo.hasNextPage) {
              return nextPage(page);
            }
            resolve();
          }
        } catch (e) {
          console.log("interceptor: ", e);
        }
      };

      await page.on("response", interceptor);
      await page.goto(runlist_url);
      isLoginPage(page) && (await Login(page));
      await closeModal(page);

      const page_url = await page.url();
      const { pathname } = URL.parse(page_url);
      result.url = page_url || "";
      result.section = pathname || "";
    });

    page.removeListener("request", interceptor);
    await page.close();
    await browser.close();
    console.log("finished!");
    console.timeEnd("used time");
    return result;
  } catch (e) {
    console.log("EBlockListCrawler: ", e);
    return Promise.reject(e);
  }
};

export default EBlockListCrawler;
