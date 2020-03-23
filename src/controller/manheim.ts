import ManheimCrawler from '../crawler/manheim';

async function ManheimController(ctx) {
  try {

    // const {
    //     crawl_target,
    //     crawl_section,
    //     crawl_queue,
    //     result_store_address,
    //     mission_id
    // } = ctx.request.body

    await ManheimCrawler();

    ctx.body = {
      message: 'success'
    }

  } catch (e) {
    console.log("ManheimController error: ", e);
  }
}

export default ManheimController;
