import eblockDetailCrawler from '../crawler/eblock/detail';
async function EBlockController(ctx) {
    try {
        const { crawl_queue } = ctx.request.body;
        console.log(crawl_queue);
        await eblockDetailCrawler({list: crawl_queue});
    }catch(e) {
        console.log('EBlockController: ', e);
    }
}

export default EBlockController