const puppeteer = require("puppeteer");
import { mapLimit } from "../../utils/crawler";
import { get as myGet } from "lodash";

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

const mapParamToState = {
  url: async (page: any) => {
    return (
      (await page.evaluate(() => {
        return window.location.href;
      })) || ""
    );
  },
  carfax_url: async page => {
    try {
      const _handle = await page.$(
        "section [data-testid=VehicleHistorySection] form"
      );
      if (_handle) {
        return (
          (await page.evaluate(item => {
            return item.action;
          }, _handle)) || ""
        );
      }

      return (
        (await page.evaluate(() => {
          const _get = (data: any, path: string[] | string) => {
            if (typeof path === "string") {
              path = path.split(".");
            }
            var i,
              len = path.length;
            for (i = 0; typeof data === "object" && i < len; ++i) {
              if (data === null || data === undefined) return false;
              data = data[path[i]];
            }
            return data;
          };

          const buyReportUrl = _get(
            window,
            "INITIAL_STATE.pages.vip.listing.vehicleReport.buyReportUrl"
          );
          return buyReportUrl;
        })) || ""
      );
    } catch (error) {
      console.log("[get carfax_url error]: ", error);
      return empty_placeholder;
    }
  },
  image_url: async (page) => {
    try {
      let _results = [];
      const btn = await page.$('[data-testid="vehicle-image-container"] ~ button');
      if(!btn) return _results
      await page.click('[data-testid="vehicle-image-container"] ~ button');
      await page.waitFor('[role="dialog"] [data-testid="vehicle-image-container"] picture source');
      const container = await page.$('[role="dialog"] div:nth-of-type(2)')
      if(!container) return _results;
      await page.evaluate((contain) => {
        contain.scrollTop = contain.scrollHeight;
        return true
      }, container)
      const images = await page.$$('[role="dialog"] [data-testid="vehicle-image-container"] picture source');
      if(!images) return _results
      return await Promise.all(Array.from(images).map(async i => await page.evaluate((v) => {
          const srcset = ((v || {}) as HTMLImageElement).srcset || (((v || {}) as any).dataset || {}).srcset
          if(!srcset) return ''
          const match = srcset.match(/(?<=1200w\,\s).*(?=\s1600w)/)
          return match ? 'https:' + match : ''
        }, i)
      ))

      // for(let i of Array.from(images)) {
      //   const url = await page.evaluate((v) => {
      //     const srcset = ((v || {}) as HTMLImageElement).srcset || (((v || {}) as any).dataset || {}).srcset
      //     console.log(srcset, '==================')
      //     if(!srcset) return ''
      //     const match = srcset.match(/(?<=1200w\,\s).*(?=\s1600w)/)
      //     return match ? 'https:' + match : ''
      //   }, i)
      //   _results.push(url);
      // }
      // return _results
    }catch(e) {
      console.log('image_url: ', e)
    }
  },
  title: "INITIAL_STATE.pages.vip.listing.title",
  current_price:
    "INITIAL_STATE.pages.vip.listing.prices.consumerPrice.localized",
  vehicle_id: "INITIAL_STATE.pages.vip.listing.id",
  description: "INITIAL_STATE.pages.vip.listing.htmlDescription",
  avg_sold_price: "INITIAL_STATE.pages.vip.listing.priceRating.averagePrice",
  seller_name: [
    "INITIAL_STATE.pages.vip.listing.contact.name",
    "INITIAL_STATE.pages.vip.listing.contact.type"
  ],
  seller_start: "INITIAL_STATE.pages.vip.listing.dealerRating.rating"
};

const abort_list = [
  "/en_US/fbevents.js",
  "/consumer/auth-cis/exchange",
  "/async_usersync",
  "/agent/v3/latest/t.js",
  "/js/ld/ld.js",
  "/bat.js"
];
const detail_base_url = "https://www.kijijiautos.ca/vip/";

function interceptedRequest(request) {
  if (abort_list.some(v => request.url().indexOf(v) > -1)) {
    return request.abort();
  }
  if (
    request.url().endsWith(".jpg") ||
    request.url().endsWith(".woff2") ||
    request.url().endsWith(".svg") ||
    request.url().endsWith(".woff")
  ) {
    return request.abort();
  }
  request.continue();
}


async function crawling(browser: any, id: string): Promise<any> {
  const page = await browser.newPage();
  const _url = `${detail_base_url}${id}/`
  try {
    let result = {};
    await page.setRequestInterception(true);
    page.on("request", interceptedRequest);
    await page.goto(_url);

    await page.waitForResponse(response =>
      response.url().indexOf(`/vip/${id}`)
    );

    const pageName = await page.evaluate(res => {
      const _get = (data: any, path: string[] | string) => {
        if (typeof path === "string") {
          path = path.split(".");
        }
        var i,
          len = path.length;
        for (i = 0; typeof data === "object" && i < len; ++i) {
          if (data === null || data === undefined) return false;
          data = data[path[i]];
        }
        return data;
      };

      return _get(window, "INITIAL_STATE.page");
    });

    if (pageName !== "vip") {
      throw Error("Invalid car id.");
    }

    // fixed fields
    const pendings = Object.entries(mapParamToState).map(async ([k, v]) => {
      if (typeof v === "function") {
        return (result[k] = await v(page));
      }

      result[k] =
        (await page.evaluate(path => {
          const _get = (data: any, path: string[] | string) => {
            if (typeof path === "string") {
              path = path.split(".");
            }
            var i,
              len = path.length;
            for (i = 0; typeof data === "object" && i < len; ++i) {
              if (data === null || data === undefined) return false;
              data = data[path[i]];
            }
            return data;
          };

          if (Array.isArray(path)) {
            let matched;
            path.find(v => {
              const val = _get(window, v);
              if (val) {
                matched = val;
                return true;
              }
            });
            return matched;
          }

          return _get(window, path);
        }, v)) || "";
    });
    await Promise.all(pendings);

    // dynamic fields
    try {
      const list =
        (await page.evaluate(() => {
          const _get = (data: any, path: string[] | string) => {
            if (typeof path === "string") {
              path = path.split(".");
            }
            var i,
              len = path.length;
            for (i = 0; typeof data === "object" && i < len; ++i) {
              if (data === null || data === undefined) return false;
              data = data[path[i]];
            }
            return data;
          };

          return _get(
            window,
            "INITIAL_STATE.pages.vip.listing.attributeGroups"
          );
        })) || [];

      let _detail = {};

      list.map(v => {
        if (myGet(v, "tag", "") === "equipment") {
          let equipment = "";
          v.attributes.map((item, i, all) => {
            const val = myGet(item, "values[0]");
            equipment += val ? `${val}${i < all.length - 1 ? ";" : ""}` : "";
          });

          _detail["equipment"] = equipment;
          return;
        }
        v.attributes.map(item => {
          if (myGet(item, "values[1]")) {
            _detail[item.values[0]] = item.values[1];
          }
        });
      });

      result = { ...result, ..._detail };
    } catch (error) {
      console.log("[get overview error]: ", error);
    }

    page.removeListener("request", interceptedRequest);
    // await page.close();
    return result;
  } catch (error) {
    page.removeListener("request", interceptedRequest);
    // await page.close();
    return Promise.reject({url: _url, vehicle_id: id});
  }
}

const storeInRedis = (mission_id: any, isLast: boolean) => async (
  result: IResult
) => {
  // store in redis
  console.log("isLast: ", isLast);
  console.log("result: ", result);
};

// test

const crawl_queue = [
  // "13719105",
  // "12926572",
  // "12953570",
  // "10805682",
  // "123",
  // "2727598"
  // "12926572"
  "13004672",
  "13224026"
];
const mission_id = "mission_id";
kijijiCarDetail(mission_id, crawl_queue);

export default async function kijijiCarDetail(mission_id, queue) {
  try {
    console.log("[kijijiauto detail crawl start]");
    console.time("used time");
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ["--no-sandbox", "--start-maximized"],
      defaultViewport: null,
    });
    const success_list = [];
    const error_list = [];
    const limit = 10;
    await mapLimit(queue, limit, (id, isLast) =>
      crawling(browser, id)
        .then(item => {
          success_list.push(id);
          storeInRedis(mission_id, isLast)(item);
        })
        .catch(e => {
          error_list.push(id);
          storeInRedis(mission_id, isLast)(e);
        })
    );
    // await browser.close();
    console.log("success: ", success_list);
    console.log("error: ", error_list);
    console.timeEnd("used time");
  } catch (e) {
    console.log("kijijiCarDetail: ", e);
    return Promise.reject(e);
  }
}
