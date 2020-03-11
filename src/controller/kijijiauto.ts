import kijijiautoDetailCrawler from "../crawler/kijijiauto/detail";

const KijijiautoController = async ctx => {
  try {
    const { crawl_queue, mission_id } = ctx.request.body;
    await kijijiautoDetailCrawler(mission_id, crawl_queue);
    console.log('[kijijiauto crawler finished !]');
  } catch (e) {
    console.log("KijijiautoController: ", e);
  }
};

export default KijijiautoController;
