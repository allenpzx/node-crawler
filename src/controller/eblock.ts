import eblockDetailCrawler from '../crawler/eblock/detail';
async function EBlockController(ctx) {
    try {
        const { crawl_queue, mission_id } = ctx.request.body;
        console.log(crawl_queue);
        await eblockDetailCrawler({ ids: crawl_queue, mission_id });
    }catch(e) {
        console.log('EBlockController: ', e);
    }
}

export default EBlockController