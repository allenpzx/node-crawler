const puppeteer = require("puppeteer");
const path = require("path");
const https = require('https');
const fs = require('fs');

function urlToBlob(url: string) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(`${path.resolve(__dirname)}/img.jpg`);
        const req = https.request(url, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            res.pipe(file)
        })
        req.end()
        file.on('finish', () => resolve(file))
    }).then(res => {
        return res
    }).catch(e => {
        console.log('url to Blob error: ', e)
        return Promise.reject(e)
    })
}

async function ManheimCrawler() {
  try {
    console.log("[ManheimCrawler]");

    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ["--start-maximized"],
      defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto("https://ant.design/components/upload-cn/"); 

    // const _img = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1584697647011&di=356b8a7d89f333d348e42ed7148ec458&imgtype=0&src=http%3A%2F%2F46.s21i-2.faidns.com%2F2841046%2F2%2FABUIABACGAAg5Ou0mQUo1pmzjwMw6Ac4lAU.jpg'
    // const file = await urlToBlob(_img);

    // console.log('file: ', file)
    const trigger = '#components-upload-demo-basic input';
    // await page.waitForSelector(trigger);
    const fileInput = await page.$(trigger);
    await fileInput.uploadFile(path.resolve(__dirname, './img.jpg'));

    const btn = '#components-upload-demo-basic button'
    await page.waitFor(btn);
    await page.click(btn);

    console.log('finished!')
    // await browser.close();
  } catch (e) {
    console.log("ManheimCrawler error: ", e);
  }
}

// ManheimCrawler();

export default ManheimCrawler;
