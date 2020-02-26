const puppeteer = require("puppeteer");
const url = require("url");
import { mapLimit, getText, getHref } from "../../utils/crawler";
import { Login, isLoginPage } from "./login";
import { get as _get } from "lodash";

interface IResult {
  url: string;
  section: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  stock: string;
  odometer: string;
  odometer_unit: string;
  doors: string;
  passengers: string;
  body_type: string;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  engine: string;
  drivetrain: string;
  fuel_type: string;
  options: string;
  seller_notes: string;
  seller_name: string;
  pick_up_location: string;
  auction: string;
  auction_date: string;
  starting_bid: string;
  carfax_url: string;
  score: string;
  damages: string;
  declaration: string;
  vin: string;
  damages_detail: {};
  tires: {};
  paint: {};
  image_urls: string[];
}

const resultInit: IResult = {
  url: "",
  section: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  stock: "",
  odometer: "",
  odometer_unit: "",
  doors: "",
  passengers: "",
  body_type: "",
  exterior_color: "",
  interior_color: "",
  transmission: "",
  engine: "",
  drivetrain: "",
  fuel_type: "",
  options: "",
  seller_notes: "",
  seller_name: "",
  pick_up_location: "",
  auction: "",
  auction_date: "",
  starting_bid: "",
  carfax_url: "",
  score: "",
  damages: "",
  declaration: "",
  vin: "",
  damages_detail: {},
  tires: {},
  paint: {},
  image_urls: []
};

const mapParamToHandles = {
  url: async (page: any, result: IResult) => await page.url(),
  section: async (page: any, result: IResult) => {
    const _url = await page.url();
    const { pathname } = url.parse(_url);
    return pathname || "";
  },
  year:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(1) [class^=featureListItemText] > p:nth-of-type(2)",
  make:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(2) [class^=featureListItemText] > p:nth-of-type(2)",
  model:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(3) [class^=featureListItemText] > p:nth-of-type(2)",
  trim:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(4) [class^=featureListItemText] > p:nth-of-type(2)",
  stock:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(5) [class^=featureListItemText] > p:nth-of-type(2)",
  odometer: async (page: any, result?: IResult) => {
    const handle = await page.$(
      "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(6) [class^=featureListItemText] > p:nth-of-type(2)"
    );
    if (!handle) return "";
    const str = await page.evaluate(
      el => (el && el.textContent ? el.textContent : ""),
      handle
    );
    if (!str) return "";
    const regex = /^\d+[0-9\,]+\d/;
    const res = str.match(regex);
    return res ? res[0] : "";
  },
  odometer_unit: async (page: any, result: IResult) => {
    const handle = await page.$(
      "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(6) [class^=featureListItemText] > p:nth-of-type(2)"
    );
    if (!handle) return "";
    const str = await page.evaluate(
      el => (el && el.textContent ? el.textContent : ""),
      handle
    );
    if (!str) return "";
    const regex = /[a-z]+/;
    const res = str.match(regex);
    return res ? res[0] : "";
  },
  doors:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(7) [class^=featureListItemText] > p:nth-of-type(2)",
  passengers:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(8) [class^=featureListItemText] > p:nth-of-type(2)",
  body_type:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(9) [class^=featureListItemText] > p:nth-of-type(2)",
  exterior_color:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(10) [class^=featureListItemText] > p:nth-of-type(2)",
  interior_color:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(11) [class^=featureListItemText] > p:nth-of-type(2)",
  transmission:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(12) [class^=featureListItemText] > p:nth-of-type(2)",
  engine:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(13) [class^=featureListItemText] > p:nth-of-type(2)",
  drivetrain:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(14) [class^=featureListItemText] > p:nth-of-type(2)",
  fuel_type:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=sectionContentInner] [class^=featureList] button:nth-of-type(15) [class^=featureListItemText] > p:nth-of-type(2)",
  options: async (page: any, result: IResult) => {
    try {
      const handle = await page.$$(
        "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(3) [class^=sectionContent] [class^=tagList] li[class^=tag]"
      );
      if (!handle) return "";
      let str = "";
      for (let i = 0; i < handle.length; i++) {
        const next = `${
          i > 0 && i < handle.length - 1 ? ";" : ""
        }${await getText(page, handle[i])}`;
        str += next;
      }
      return str;
    } catch (error) {
      return "";
    }
  },
  seller_notes:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(4) [class^=sectionContentInner] [class^=sellerNotesContent]",
  seller_name: "[class^=consignerName]",
  pick_up_location:
    "#VehicleDetails > section:nth-of-type(2) [class^=container]:last-child > [class^=content] > [class^=details] > [class^=detailsText] [class^=name]",
  auction:
    "#VehicleDetails > section:nth-of-type(2) > div[class^=upcomingAuction] > dl:nth-of-type(1) > dd:nth-of-type(1)",
  auction_date:
    "#VehicleDetails > section:nth-of-type(2) > div[class^=upcomingAuction] > dl:nth-of-type(1) > dd:nth-of-type(2)",
  starting_bid:
    "#VehicleDetails > section:nth-of-type(2) > div[class^=upcomingAuction] > dl:nth-of-type(1) > dd:nth-of-type(3)",
  carfax_url: async (page: any, result: IResult) => {
    try {
      const handle = await page.$(
        "#VehicleDetails [class^=crButtonContainer]:nth-child(1) > a"
      );
      if (!handle) return "";
      return getHref(page, handle);
    } catch (error) {
      return "";
    }
  },
  score:
    "#VehicleDetails [class^=crButtonContainer]:nth-child(2) [class^=crButtonText]",
  damages:
    "#VehicleDetails [class^=crButtonContainer]:nth-child(3) [class^=crButtonText]",
  damages_detail: async (page: any, results: IResult) => {
    try {
      let result: any = {};
      const paint_btn = await page.$(
        "#VehicleDetails [class^=crButtonContainer]:nth-child(4) [class^=crButtonSmContainer]:nth-of-type(1) button"
      );

      if (paint_btn) {
        await page.click(
          "#VehicleDetails [class^=crButtonContainer]:nth-child(4) [class^=crButtonSmContainer]:nth-of-type(1) button"
        );
        const summary = await page.$$(
          "#VehicleDetails + [class^=details] > [class^=inner] > [class^=content] > div > [class^=summarySection] > ul > li"
        );
        if (summary) {
          for (const item of summary) {
            const obj =
              (await page.evaluate(el => {
                let obj: any = {};
                const key = (el.querySelector("div:nth-of-type(1)") || {})
                  .textContent;
                const val = (el.querySelector("div:nth-of-type(2)") || {})
                  .textContent;
                if (key && val) {
                  obj[key] = val;
                }
                return obj;
              }, item)) || {};
            result = { ...result, ...obj };
          }
        }
        const detail = await page.$$(
          "#VehicleDetails + [class^=details] > [class^=inner] > [class^=content] > div > ul > li[class^=listItem]"
        );
        if (detail) {
          for (const item of detail) {
            const obj =
              (await page.evaluate(el => {
                let obj: any = {};
                const key = (el.querySelector("div:nth-of-type(1)") || {})
                  .textContent;
                const val = (el.querySelector("div:nth-of-type(2)") || {})
                  .textContent;
                if (key && val) {
                  obj[key] = val;
                }
                return obj;
              }, item)) || {};
            result = { ...result, ...obj };
          }
        }
        await page.click(
          "#VehicleDetails + [class^=details] > [class^=inner] > [class^=header] > [class~=button]"
        );
      }
      return {...results.damages_detail, ...result}
    } catch (error) {
      console.log("damages detail: ", error);
      return {};
    }
  },
  tires: async (page: any, result: IResult) => {
    try {
      const handle = await page.$$(
        "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(1) [class^=sectionContentInner] + [class^=crRow] [class^=crRowList] li strong"
      );
      if ((handle || []).length > 0) {
        let str = "";
        for (let i = 0; i < handle.length; i++) {
          const next = `${
            i > 0 && i < handle.length - 1 ? ";" : ""
          }${await getText(page, handle[i])}`;
          str += next;
        }
        return str;
      }
      return "";
    } catch (e) {
      console.log("tires: ", e);
      return "";
    }
  },
  paint: async (page: any, result: IResult) => {
    try {
      const handle = await page.$$(
        "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(1) [class^=sectionContentInner] + [class^=crRow] + [class^=crRow] [class^=crRowList] li strong"
      );
      if ((handle || []).length > 0) {
        let str = "";
        for (let i = 0; i < handle.length; i++) {
          const next = `${
            i > 0 && i < handle.length - 1 ? ";" : ""
          }${await getText(page, handle[i])}`;
          str += next;
        }
        return str;
      }
      return "";
    } catch (e) {
      console.log("tires: ", e);
      return "";
    }
  },
  declaration: async (page: any, result: IResult) => {
    try {
      const handle = await page.$$(
        "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(2) [class^=sectionContent] > [class^=tagList] > li[class^=tag]"
      );
      if ((handle || []).length > 0) {
        let str = "";
        for (let i = 0; i < handle.length; i++) {
          const next = `${
            i > 0 && i < handle.length - 1 ? ";" : ""
          }${await getText(page, handle[i])}`;
          str += next;
        }
        return str;
      }
      return "";
    } catch (e) {
      console.log("tires: ", e);
      return "";
    }
  },
  vin:
    "#VehicleDetails > section:nth-of-type(2) [class^=inventory] > section:nth-of-type(5) [class^=vin] [class^=featureTitle] + p > strong"
};

const generateUrl = (id: string) =>
  `https://app.eblock.com/buy/run-list?distance=500&id=${id}&mileageLTE=105780&savedSearchId=a195a720-5a2a-46ad-91ac-018f862484a3&yearGTE=2013`;

const closeModal = async page => {
  try {
    await page.waitFor("#modal-root button[class^=close]");
    await page.click("#modal-root button[class^=close]");
  } catch (e) {
    console.log("close modal error");
  }
};

/**
 * 数据爬取
 */
async function crawling(
  browser: any,
  id: string,
): Promise<any> {
  let result: IResult = resultInit;
  const interceptor = async res => {
    try {
      if (res.url().indexOf("/graphql") >= 0) {
        const ct = res.headers()['content-type'];
        const isok = ct && ct.startsWith('application/json');
        if(!isok) return
        const data = await res.json();
        // handle car images
        const photos = _get(data, "data.auctionItem.inventoryItem.photos");
        const image_urls =
          (Array.isArray(photos) && photos.map(v => _get(v, "main"))) || [];
        if(image_urls) {
          result.image_urls = image_urls.length > 0 ? image_urls : []
        }

        // handle car tires
        const tires = _get(
          data,
          "data.auctionItem.inventoryItem.tireCondition"
        );
        if (tires) {
          const ok_placement = "YES";
          const unok_placement = "NO";
          const empty_placement=  '';
          const obj = {
            TPMS: _get(tires, "tirePressureMonitoringSystem")
              ? ok_placement
              : unok_placement,
            Winter_Tires: _get(tires, "winterTires")
              ? ok_placement
              : unok_placement,
            Second_Set_of_Tires: _get(tires, "secondSetOfTires")
              ? ok_placement
              : unok_placement,
            Four_Matching_Tires: _get(tires, "fourMatchingTires")
              ? ok_placement
              : unok_placement,
            Left_Front_Tire: {
              Brand: _get(tires, "driverFrontBrand") || empty_placement,
              Tire_Size: _get(tires, "driverFrontSize") || empty_placement,
              Tread: _get(tires, "driverFrontTread.formatted") || empty_placement
            },
            Right_Front_Tire: {
              Brand: _get(tires, "passengerFrontBrand") || empty_placement,
              Tire_Size: _get(tires, "passengerFrontSize") || empty_placement,
              Tread: _get(tires, "passengerFrontTread.formatted") || empty_placement
            },
            Left_Back_Tire: {
              Brand: _get(tires, "driverRearBrand") || empty_placement,
              Tire_Size: _get(tires, "driverRearSize") || empty_placement,
              Tread: _get(tires, "driverRearTread.formatted") || empty_placement
            },
            Right_Back_Tire: {
              Brand: _get(tires, "passengerRearBrand") || empty_placement,
              Tire_Size: _get(tires, "passengerRearSize") || empty_placement,
              Tread: _get(tires, "passengerRearTread.formatted") || empty_placement
            }
          };
          result = {
            ...result,
            damages_detail: { ...result.damages_detail, ...obj }
          };
        }
      }
    } catch (e) {
      console.log("catch response: ", e);
    }
  }
  const page = await browser.newPage();
  try {
    await page.on("response", interceptor);
    const url = generateUrl(id);
    await page.goto(url);
    isLoginPage(page) && (await Login(page));
    await closeModal(page);
    await page.waitFor("#VehicleDetails");

    const pendings = Object.entries(mapParamToHandles).map(async ([k, v]) => {
      if (typeof v === "string") {
        const handle = await page.$(v);
        return (result[k] = handle ? await getText(page, handle) : "");
      }
      return (result[k] = await v(page, result));
    });
    await Promise.all(pendings);
    // await store(result);
    await page.removeListener("request", interceptor);
    await page.close();
    // console.log("result: ", result);
    return result
  } catch (e) {
    page.removeListener("request", interceptor);
    await page.close();
    console.log("error: ", e);
    return Promise.reject(id)
  }
}
interface IProps {
  (props: { ids: string[]; mission_id: string }): Promise<
    any
  >;
}

const eblockDetailCrawler: IProps = async function(props) {
  try {
    console.log("------------------------crawling------------------------");
    console.time("used time");

    const { ids, mission_id } = props;
    const browser = await puppeteer.launch();
    const success_list = [];
    const error_list = [];
    const limit = 10;

    await mapLimit(ids, limit, (id, isLast) =>
      crawling(browser, id)
        .then((item: IResult) => {
          success_list.push(id)
          console.log('success', '[', id, ']' ,item);
        })
        .catch((e) => {
          error_list.push(id)
          console.log('error', '[', id, ']', e)
        })
    );
    await browser.close();

    console.timeEnd("used time");
  } catch (e) {
    console.log("[eblock detail page crawler error]: ", e);
  }
};

export default eblockDetailCrawler;
