const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const URL = require("url");
import { mapLimit } from "../../utils/crawler";
import { Login, isLoginPage } from "./util";
import { get as _get, isEmpty } from "lodash";

interface IResult {
  url?: string;
  section?: string;
  title?: string;
  year?: string | number;
  make?: string;
  model?: string;
  trim?: string;
  stock?: string;
  odometer?: string;
  doors?: string | number;
  passengers?: string | number;
  body_type?: string;
  exterior_color?: string;
  interior_color?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  options?: any[];
  seller_notes?: string;
  seller_name?: string;
  runnumber?: string;
  lane?: string;
  auction?: string;
  auction_date?: string;
  starting_bid?: string | number;
  carfax_url?: string;
  score?: string | number;
  tires?: any;
  paint?: any;
  declaration?: any[];
  image_urls?: any[];
  vin?: string;
  vehicle_id?: string;
  cylinders?: string | number;
  displacement?: string | number;
  damage_detail?: string[];
  pick_up_location?: string;
}

const mapParamToResponse = {
  title: (auctionItem, result) => {
    result["title"] = `${_get(auctionItem, "inventoryItem.year")} ${_get(
      auctionItem,
      "inventoryItem.make"
    )} ${_get(auctionItem, "inventoryItem.model")} ${_get(
      auctionItem,
      "inventoryItem.trim"
    )}`;
  },
  damage_detail: (auctionItem, result) => {
    result["damage_detail"] = _get(
      auctionItem,
      "inventoryItem.damagePhotos",
      []
    ).map(v => _get(v, "location"));
  },
  pick_up_location: async (auctionItem, result) => {
    const location = _get(auctionItem, "inventoryItem.pickupLocation");
    if (location) {
      result["pick_up_location"] = `${_get(location, "name", " ")} ${_get(
        location,
        "streetNumber",
        " "
      )} ${_get(location, "streetName", " ")} ${_get(
        location,
        "city",
        " "
      )} ${_get(location, "region", " ")} ${_get(location, "regionCode", " ")}`;
    }
  },
  year: "inventoryItem.year",
  make: "inventoryItem.make",
  model: "inventoryItem.model",
  trim: "inventoryItem.trim",
  stock: "inventoryItem.stockNumber",
  odometer: "inventoryItem.mileage.formattedAmount",
  doors: "inventoryItem.numberOfDoors",
  passengers: "inventoryItem.numberOfPassengers",
  body_type: "inventoryItem.bodyType",
  exterior_color: "inventoryItem.exteriorColor",
  interior_color: "inventoryItem.interiorColor",
  transmission: "inventoryItem.transmission",
  drivetrain: "inventoryItem.driveTrain",
  fuel_type: "inventoryItem.fuelType",
  options: "inventoryItem.selectedOptions",
  seller_notes: "inventoryItem.sellerNotes",
  seller_name: "inventoryItem.consigner.name",
  runnumber: "runNumber",
  lane: "auctionTimeSlotLane.name",
  auction: "auction.title",
  auction_date: "auctionTimeSlot.startTime",
  starting_bid: "startingBid.amount",
  carfax_url: "inventoryItem.conditionReport.carfaxCanadaReportUrl",
  score: "inventoryItem.conditionReport.overallConditionRating",
  tires: "inventoryItem.tireCondition",
  paint: "inventoryItem.paintCondition",
  declaration: "inventoryItem.conditionReport.activeDeclarations",
  image_urls: "inventoryItem.photos",
  vin: "inventoryItem.vin",
  vehicle_id: "id",
  cylinders: "inventoryItem.cylinders",
  displacement: "inventoryItem.displacement"
};

const generateUrl = (id: string) =>
  `https://app.eblock.com/buy/run-list?distance=500&id=${id}&mileageLTE=105780&savedSearchId=a195a720-5a2a-46ad-91ac-018f862484a3&yearGTE=2013`;

async function crawling(browser: any, id: string): Promise<any> {
  let result: any = {};
  const page = await browser.newPage();
  const url = generateUrl(id);
  let interceptor: any;

  try {
    await new Promise(async (resolve, reject) => {
      const interceptor = async res => {
        try {
          if (
            res.url().indexOf("/graphql") >= 0 &&
            (res.headers()["content-type"] || "").startsWith("application/json")
          ) {
            const data = await res.json();
            const inside_data = _get(data, "data");
            const hasAuctionProperty = Object.prototype.hasOwnProperty.call(
              inside_data,
              "auctionItem"
            );
            const auctionItem = _get(data, "data.auctionItem");

            if (hasAuctionProperty && isEmpty(auctionItem)) {
              // throw Error('Invalid id!');
              reject();
            }

            if (hasAuctionProperty && !isEmpty(auctionItem)) {
              const pendings = Object.entries(mapParamToResponse).map(
                async ([k, v]) => {
                  if (typeof v === "string") {
                    return (result[k] = _get(auctionItem, v));
                  }
                  return await v(auctionItem, result);
                }
              );
              await Promise.all(pendings);
              resolve();
            }
          }
        } catch (e) {
          return Promise.reject(e);
        }
      };

      await page.on("response", interceptor);
      await page.goto(url);

      // login
      isLoginPage(page) && (await Login(page));

      await page.waitForResponse(async response => {
        if (
          response.url().indexOf("/graphql") >= 0 &&
          (response.headers()["content-type"] || "").startsWith(
            "application/json"
          )
        ) {
          const data = await response.json();
          const inside_data = _get(data, "data");
          return (
            inside_data &&
            Object.prototype.hasOwnProperty.call(inside_data, "auctionItem")
          );
        }
      });
    });

    result.url = (await page.evaluate(() => window.location.href)) || "";
    result.section = _get(
      URL.parse(await page.evaluate(() => window.location.href)),
      "pathname"
    );

    interceptor && (await page.removeListener("request", interceptor));
    await page.close();
    return result;
  } catch (e) {
    interceptor && (await page.removeListener("request", interceptor));
    await page.close();
    return Promise.reject({ url, vehicle_id: id });
  }
}
interface IProps {
  (props: { queue: string[]; mission_id: string }): Promise<any>;
}

function pipeDetail(item) {
  const fileName = path.resolve(__dirname, "./details.json");
  const isExist = fs.existsSync(fileName);
  const fileData = JSON.stringify(
    (isExist ? JSON.parse(fs.readFileSync(fileName)) : []).concat(item)
  );
  fs.writeFileSync(fileName, fileData);
}

const eblockDetailCrawler: IProps = async function(props) {
  try {
    console.log("------------------------crawling------------------------");
    console.time("used time");

    const { queue, mission_id } = props;
    const browser = await puppeteer.launch();
    const success_list = [];
    const error_list = [];
    const limit = 10;
    let detail_list = [];

    await mapLimit(queue, limit, (id, isLast) =>
      crawling(browser, id)
        .then((item: IResult) => {
          success_list.push(id);
          detail_list.push(item);
          console.log(item);
          pipeDetail(item)
        })
        .catch(e => {
          error_list.push(id);
          console.log("catch error: ", e);
        })
    );
    await browser.close();

    console.timeEnd("used time");
    return detail_list;
  } catch (e) {
    console.log("[eblock detail page crawler error]: ", e);
    return Promise.reject(e);
  }
};

export default eblockDetailCrawler;
