import puppeteer from "puppeteer";
import url from "url";
import { mapLimit, getText, getHref } from "../../utils/crawler";
import { Login, isLoginPage } from "./login";

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

const mapParamToHandles = {
  url: async (page: any) => await page.url(),
  section: async (page: any) => {
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
  odometer: async (page: any) => {
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
    const result = str.match(regex);
    return result ? result[0] : "";
  },
  odometer_unit: async (page: any) => {
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
    const result = str.match(regex);
    return result ? result[0] : "";
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
  options: async (page: any) => {
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
  carfax_url: async (page: any) => {
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
  //   damages_detail: async (page: any) => {
  //     try {
  //       let result = {};
  //       const paint_btn = await page.$(
  //         "#VehicleDetails [class^=crButtonContainer]:nth-child(4) [class^=crButtonSmContainer]:nth-child(1) button"
  //       );
  //       const tires_btn = await page.$(
  //         "#VehicleDetails [class^=crButtonContainer]:nth-child(4) [class^=crButtonSmContainer]:nth-child(2) button"
  //       );

  //       if (paint_btn) {
  //         console.log("paint_btn");
  //         await page.click(paint_btn);
  //       }

  //       if (tires_btn) {
  //         console.log("tires_btn");
  //         await page.click(paint_btn);
  //       }

  //       //   const _handle =
  //       //     "#VehicleDetails + [class^=details] > [class^=inner] > [class^=content] > div > ul > li[class^=listItem] img";
  //       //   await page.waitFor(_handle);
  //       //   const handle = await page.$$(_handle);
  //       //   let arr = [];
  //       //   if ((handle || []).length > 0) {
  //       //     for (const li in handle) {
  //       //       arr.push(await page.evaluate(el => (el || {}).src, li));
  //       //     }
  //       //     return arr;
  //       //   }
  //       //   return arr;
  //     } catch (error) {
  //       return {};
  //     }
  //   },
  tires: async (page: any) => {
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
  paint: async (page: any) => {
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
        console.log("str: ", str);
        return str;
      }
      return "";
    } catch (e) {
      console.log("tires: ", e);
      return "";
    }
  },
  declaration: async (page: any) => {
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
        console.log("str: ", str);
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
  storeInRedis: (result) => Promise<any>
): Promise<any> {
  const page = await browser.newPage();
  await page.setViewport({
    width: 5000,
    height: 5000,
    deviceScaleFactor: 1
  });

  try {
    const url = generateUrl(id);
    await page.goto(url);
    isLoginPage(page) && (await Login(page));
    await closeModal(page);
    await page.waitFor("#VehicleDetails");
    let result = {};

    const pendings = Object.entries(mapParamToHandles).map(async ([k, v]) => {
      if (typeof v === "string") {
        const handle = await page.$(v);
        return (result[k] = handle ? await getText(page, handle) : "");
      }
      return (result[k] = await v(page));
    });
    await Promise.all(pendings);
    // await page.close();
    await storeInRedis(result);
    console.log("result: ", result);
  } catch (e) {
    await page.close();
    console.log("error: ", e);
  }
}

interface IConfig {
  url: string;
  user: string;
  pwd: string;
  collection: string;
}
interface IStoreInRedis {
  // (result: IResult): Promise<any>;
  (config: IConfig): (result: IResult) => Promise<any>;
}

const storeInRedis: IStoreInRedis = (config: IConfig) => async (
  result: IResult
) => {
  //   console.log(result);
};

interface IProps {
  list: string[];
}

async function eblockDetailCrawler(props: IProps) {
  try {
    console.log("------------------------crawling------------------------");
    console.time("crawler");
    const result_store_address = {
      url: "127.0.0.1:27017",
      user: "brain",
      pwd: "admin4tradex",
      collection: "kijijiauto_detail"
    };

    const { list } = props;
    const browser = await puppeteer.launch({ headless: false });
    const success_list = [];
    const error_list = [];
    const limit = 10;

    await mapLimit(list, limit, id =>
      crawling(browser, id, storeInRedis(result_store_address))
        .then(() => success_list.push(id))
        .catch(() => error_list.push(id))
    );
    await browser.close();
    console.log("------------------------finished!------------------------");
    console.timeEnd("crawler");
  } catch (e) {
    console.log("[eblock detail page crawler error]: ", e);
  }
}

export default eblockDetailCrawler
