const fs = require("fs");
const path = require("path");
import eblockDetailCrawler from "../crawler/eblock/detail";
import eblockListCrawler from "../crawler/eblock/list";
async function EBlockController(ctx) {
  try {

    // const {
    //     crawl_target,
    //     crawl_section,
    //     crawl_queue,
    //     result_store_address,
    //     mission_id
    // } = ctx.request.body

    const res = await eblockListCrawler();

    fs.writeFileSync(
      path.resolve(__dirname, "listing.json"),
      JSON.stringify(res)
    );

    const queue = res.listing.map(v => v.vehicle_id);
    const mission_id = "";
    const detail_list = await eblockDetailCrawler({ queue, mission_id });

    fs.writeFileSync(
      path.resolve(__dirname, "details.json"),
      JSON.stringify(detail_list)
    );

  } catch (e) {
    console.log("EBlockController: ", e);
  }
}

export default EBlockController;
