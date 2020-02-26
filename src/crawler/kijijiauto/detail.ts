// import query from "../../db";

const puppeteer = require("puppeteer");
import { mapLimit } from '../../utils/crawler';

interface IResult {
  url?: string;
  title?: string;
  current_price?: string;
  condition?: string;
  make?: string;
  model?: string;
  year?: string;
  trim?: string;
  odometer?: string;
  odometer_unit?: string;
  body_style?: string;
  colour?: string;
  vehicle_id?: string;
  transmission?: string;
  fuel_type?: string;
  drivetrain?: string;
  cylinders?: string;
  equipment?: string;
  description?: string;
  avg_sold_price?: string;
  carfax_url?: string;
  seller_name?: string;
  seller_star?: string;
}

const empty_placeholder = "";

const mapParamToHandles = {
  url: async (page: any) => await page.url(),
  title: "#root [data-testid=vip] section div div section h1",
  current_price:
    "#root [data-testid=vip] section div div section h1 + div span span",
  condition:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(1) td span",
  make:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(2) td span",
  model:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(3) td span",
  year:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(4) td span",
  trim:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(5) td span",
  odometer: async page => {
    try {
      const _handle = await page.$(
        "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(6) td span"
      );
      const str = await page.evaluate(getText, _handle);
      const regex = /^\d+[0-9\,]+\d/;
      return typeof str === "string" && str.match(regex)
        ? str.match(regex)[0]
        : empty_placeholder;
    } catch (error) {
      console.log("[get odometer error]: ", error);
      return empty_placeholder;
    }
  },
  odometer_unit: async page => {
    try {
      const _handle = await page.$(
        "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(6) td span"
      );
      const str = await page.evaluate(getText, _handle);
      const regex = /[a-z]+/;
      return typeof str === "string" && str.match(regex)
        ? str.match(regex)[0]
        : empty_placeholder;
    } catch (error) {
      console.log("[get odometer_unit error]: ", error);
      return empty_placeholder;
    }
  },
  body_style:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(7) td span",
  colour:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(8) td span",
  vehicle_id:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=overview] table tbody > tr:nth-child(9) td span",
  transmission:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=mechanical] table tbody > tr:nth-child(1) td span",
  fuel_type:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=mechanical] table tbody > tr:nth-child(2) td span",
  drivetrain:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=mechanical] table tbody > tr:nth-child(3) td span",
  cylinders:
    "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=mechanical] table tbody > tr:nth-child(4) td span",
  equipment: async page => {
    try {
      //   const _handle = '#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=equipment] > ul > li > span';
      //   console.log('hanlde: ', _handle)
      //   const res = await page.$$eval(_handle, eles => {
      //       let strs = '';
      //       console.log('eles: ', eles);
      //       eles.map((v: any, i, arr)=> v ? strs += `${(i === arr.length - 1 || i === 0) ? '' : ';'}${v.textContent}` : '')
      //       return strs
      //   })
      //   console.log('res: ', res)
      //   return res

      let strs = "";
      let i = 0;
      const _handle = await page.$$(
        "#root [data-testid=vip] > div:last-child > div:first-child section > div > div > section #trackContainer > div [data-testid=equipment] > ul > li > span"
      );
      const arrHandle = Array.from(_handle);
      for (const item of arrHandle) {
        const it = await page.evaluate(v => {
          return v && v.textContent ? v.textContent : "";
        }, item);
        strs += it
          ? `${i === arrHandle.length - 1 || i === 0 ? "" : ";"}${it}`
          : "";
        i++;
      }
      return strs;
    } catch (error) {
      console.log("[get equipment error]: ", error);
      return empty_placeholder;
    }
  },
  description:
    "[data-testid=ListingDescriptionSection] > div > div:nth-child(1) > div:nth-child(1) span",
  avg_sold_price:
    "[data-testid=RatingMetric] [data-testid=PriceRatingHeader] div > dl:nth-child(2) dd span",
  carfax_url: async page => {
    try {
      //   const _handle = "section[data-testid=VehicleHistorySection] form";
      //   const str = await page.$eval(_handle, item => item.action);
      //   return typeof str === "string" ? str : null;

      const _handle = await page.$(
        "section [data-testid=VehicleHistorySection] form"
      );
      //   const str = await page.$eval(_handle, item => item.action);
      //   return typeof str === "string" ? str : null;
      return _handle
        ? await page.evaluate(item => {
            console.log(item)
            return item.action
        }, _handle)
        : empty_placeholder;
    } catch (error) {
      console.log("[get carfax_url error]: ", error);
      return empty_placeholder;
    }
  },
  seller_name:
    "[data-testid=ListingSellerInformationSection] [data-testid=SellerInformationSectionMap]+div > span",
  seller_star:
    "[data-testid=ListingSellerInformationSection] [data-testid=SellerInformationSectionMap]+div > [data-testid=SellerInformationSectionReviews] > div > span"
};

const abort_list = [
  "en_US/fbevents.js",
  "/consumer/auth-cis/exchange",
  "/async_usersync",
  "/agent/v3/latest/t.js",
  "/js/ld/ld.js",
  "/bat.js"
];
const detail_base_url = "https://www.kijijiautos.ca/vip/";
const getText = (el: any): string | null => {
  try {
    return el && el.textContent ? el.textContent : "";
  } catch (error) {
    return "";
  }
};

function interceptedRequest(request) {
  if (abort_list.some(v => request.url().indexOf(v) > -1))
    return request.abort();
  request.continue();
}

/**
 * 数据爬取
 */
async function crawling(
  browser: any,
  id: string,
): Promise<any> {
  const page = await browser.newPage();
  try {
    let result = {};
    page.on("request", interceptedRequest);
    const _url = `${detail_base_url}${id}/`;
    await page.setDefaultNavigationTimeout(0);
    await page.setRequestInterception(true);
    await page.goto(_url);
    await page.waitFor(mapParamToHandles["title"], { timeout: 5000 });

    const pendings = Object.entries(mapParamToHandles).map(async ([k, v]) => {
      if (typeof v === "function") {
        return Reflect.set(result, k, await v(page));
      }
      const _handle = await page.$(v);
      return Reflect.set(result, k, await page.evaluate(getText, _handle));
    });
    await Promise.all(pendings);

    page.removeListener("request", interceptedRequest);
    await page.close();
    return result
  } catch (error) {
    console.log(id, '===', error)
    page.removeListener("request", interceptedRequest);
    await page.close();
    return Promise.reject(id);
  }
}

const storeInRedis = (mission_id: any, isLast: boolean) => async (
  result: IResult
) => {
  // query('kijijiauto_detail', [{mission_id: mission_id, crawl_date: new Date().getTime(), data_info: result, isLast }])
  console.log('isLast: ', isLast);
  console.log(result);
};

export default async function kijijiCarDetail({mission_id, crawl_queue}) {
  try {
    console.log('start')
    console.time('used time')
    const browser = await puppeteer.launch();
    const success_list = [];
    const error_list = [];
    const limit = 10;
    await mapLimit(crawl_queue, limit, (id, isLast) =>
      crawling(browser, id)
        .then((item) => {
          success_list.push(id)
          console.log('item: ', item)
          storeInRedis(mission_id, isLast)(item)
        })
        .catch((e) => {
          error_list.push(id)
          console.log('error item: ', e)
        })
    );
    await browser.close();
    console.timeEnd('used time')
  }catch (e) {
    console.log('kijijiCarDetail: ', e)
  }
}
