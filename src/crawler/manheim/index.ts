const puppeteer = require("puppeteer");
const path = require("path");
const https = require("https");
const fs = require("fs");
const request = require("superagent");
import Upload from "../utils/upload";
// import getVIN from "../utils/getVIN";

function urlToBlob(url: string) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(`${path.resolve(__dirname)}/img.jpg`);
    const req = https.request(url, res => {
      console.log("statusCode:", res.statusCode);
      console.log("headers:", res.headers);
      res.pipe(file);
    });
    req.end();
    file.on("finish", () => resolve(file));
  })
    .then(res => {
      return res;
    })
    .catch(e => {
      console.log("url to Blob error: ", e);
      return Promise.reject(e);
    });
}

async function ManheimCrawler() {
  try {
    console.log("[ManheimCrawler]");

    // const fileName = Math.random().toFixed(8).match(/(?<=\.)\d+/)[0]
    // console.log(fileName)
    // return 

    const browser = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
      defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto("https://element.eleme.cn/#/zh-CN/component/upload", {
      waitUntil: "domcontentloaded"
    });

    const _img =
      "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1584697647011&di=356b8a7d89f333d348e42ed7148ec458&imgtype=0&src=http%3A%2F%2F46.s21i-2.faidns.com%2F2841046%2F2%2FABUIABACGAAg5Ou0mQUo1pmzjwMw6Ac4lAU.jpg";

    await request
      .get(_img)
      .then(async res => {
        const ext = path.parse(_img).ext;
        const hash = () => Math.random().toFixed(8).match(/(?<=\.)\d+/)[0];
        const fileName = `${path.resolve(__dirname, `${hash()}${ext}`)}`
        fs.writeFileSync(fileName, res.body);
        await Upload({
          page: page,
          type: "chooser",
          btnSelector:
            '.el-upload--text button', 
          inputSelector:
            '.el-upload--text input',
          file: fileName
        });
        fs.unlinkSync(fileName)
      })
      .catch(e => {
        console.log("[e]: ", e);
        return null;
      });

    // const fileUrl = new URL(_img)
    // const file = fs.readFileSync(fileUrl);

    // Upload({
    //   page: page,
    //   type: "chooser",
    //   btnSelector: '#shou-dong-shang-chuan + div .upload-demo [tabindex="0"]',
    //   inputSelector:
    //     '#shou-dong-shang-chuan + div .upload-demo [tabindex="0"] input',
    //   file: file
    // });

    // console.log(page instanceof puppeteer)

    // method1
    // await page.goto("https://element.eleme.cn/#/zh-CN/component/upload", {
    //   waitUntil: "domcontentloaded"
    // });
    // const selector = '#shou-dong-shang-chuan + div .upload-demo [tabindex="0"]';
    // await page.waitFor(selector);
    // page.click(selector);
    // const chooser = await page.waitForFileChooser();
    // await chooser.accept([path.resolve(__dirname, "./img.jpg")]);
    // await page.evaluate((selector) => {
    //   document
    //     .querySelector(
    //       `${selector} input`
    //     )
    //     .dispatchEvent(new Event("change", { bubbles: true }));
    // }, selector);

    // method2
    // await page.goto("https://graph.baidu.com/pcpage/index?tpl_from=pc", {
    //   waitUntil: "domcontentloaded"
    // });
    // const pathName = ".general-upload-file";
    // await page.waitFor(pathName);
    // const input = await page.$(pathName);
    // input.uploadFile(path.resolve(__dirname, "./img.jpg"));
    // await page.evaluate(pathName => {
    //   document
    //     .querySelector(pathName)
    //     .dispatchEvent(new Event("change", { bubbles: true }));
    // }, pathName);

    // const _img = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1584697647011&di=356b8a7d89f333d348e42ed7148ec458&imgtype=0&src=http%3A%2F%2F46.s21i-2.faidns.com%2F2841046%2F2%2FABUIABACGAAg5Ou0mQUo1pmzjwMw6Ac4lAU.jpg'
    // const file = await urlToBlob(_img);

    console.log("finished!");
    // await browser.close();
  } catch (e) {
    console.log("ManheimCrawler error: ", e);
  }
}

ManheimCrawler();

export default ManheimCrawler;
