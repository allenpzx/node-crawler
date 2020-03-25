const puppeteer = require("puppeteer");
const iPhone = puppeteer.devices['iPhone 6'];
const path = require("path");
const https = require('https');
const fs = require('fs');
import getVIN from '../utils/getVIN'

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

    // const browser = await puppeteer.launch({
    //   headless: false,
    //   devtools: true,
    //   args: ["--start-maximized"],
    //   defaultViewport: null
    // });
    // const page = await browser.newPage();

    // process.title = '试试看'
    // console.log('进程id',process.pid)
    // console.log('进程title',process.title)
    // console.log('vin: ', await getVIN());
    // await new Promise(async (resolve, reject) => {
    //     await page.on('response', async function (response) {
    //         if(response.url().indexOf('/getvin.php?type=fake') > -1) {
    //             if(response.status() === 200) {
    //                 const text = await response.text()
    //                 return resolve(text.trim())
    //             }
    //             return reject()
    //         }
    //     })
    //     await page.goto('https://randomvin.com/')
    //     await page.click('[name="mk_vin"]');
    // })

    // https://randomvin.com/getvin.php?type=fake
    // await page.emulate(iPhone);
    // await page.goto("https://ant.design/components/upload-cn/"); 

    // const _img = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1584697647011&di=356b8a7d89f333d348e42ed7148ec458&imgtype=0&src=http%3A%2F%2F46.s21i-2.faidns.com%2F2841046%2F2%2FABUIABACGAAg5Ou0mQUo1pmzjwMw6Ac4lAU.jpg'
    // const file = await urlToBlob(_img);

    // // return
    // // console.log('file: ', file)
    // const trigger = '#components-upload-demo-basic input';
    // // await page.waitForSelector(trigger);
    // const fileInput = await page.$(trigger);
    // await fileInput.uploadFile(path.resolve(__dirname, './img.jpg'));

    // const btn = '#components-upload-demo-basic button'
    // await page.waitFor(btn);
    // await page.click(btn);

    // await page.goto('https://inventory.manheim.com/listing_wizard/select_entry_method?WT.svl=m_uni_hdr#/')

    console.log('finished!')
    // await browser.close();
  } catch (e) {
    console.log("ManheimCrawler error: ", e);
  }
}

ManheimCrawler();

export default ManheimCrawler;
