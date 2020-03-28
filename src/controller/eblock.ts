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

    // const res = await eblockListCrawler();

    // fs.writeFileSync(
    //   path.resolve(__dirname, "listing.json"),
    //   JSON.stringify(res)
    // );

    // const queue = res.listing.map(v => v.vehicle_id);
    // const queue = JSON.parse(fs.readFileSync(path.resolve(__dirname, './listing.json'))).listing.map(v => v.vehicle_id);
    // console.log(queue)
    // return
    const queue = ['62730095-2ad2-4a55-a951-da09222400a1']
    const mission_id = "";
    const detail_list = await eblockDetailCrawler({ queue, mission_id });

    fs.writeFileSync(
      path.resolve(__dirname, "details.json"),
      JSON.stringify(detail_list)
    );

    ctx.body = {
      message: 'success'
    }

  } catch (e) {
    console.log("EBlockController: ", e);
  }
}

export default EBlockController;
