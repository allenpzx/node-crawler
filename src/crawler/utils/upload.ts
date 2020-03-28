const path = require("path");
const https = require("https");
const fs = require("fs");
import { Page } from 'puppeteer'

export function urlToBlob(url: string) {
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

interface IProps {
  (props: {
    page: Page;
    type: "click" | "chooser";
    btnSelector: string;
    inputSelector: string;
    file: string;
  }): Promise<any>;
}

const Upload: IProps = async ({
  page,
  type,
  btnSelector,
  inputSelector,
  file
}) => {
  try {
    if (type === "click") {
      await page.waitFor(btnSelector);
      await page.click(btnSelector);
      const chooser = await page.waitForFileChooser();
      await chooser.accept([file]);
      return await page.evaluate(
        selector =>
          document
            .querySelector(selector)
            .dispatchEvent(new Event("change", { bubbles: true })),
        inputSelector
      );
    }

    if (type === "chooser") {
      await page.waitFor(inputSelector);
      const input = await page.$(inputSelector);
      await input.uploadFile(file);
      return await page.evaluate(
        inputSelector =>
          document
            .querySelector(inputSelector)
            .dispatchEvent(new Event("change", { bubbles: true })),
        inputSelector
      );
    }

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
  } catch (e) {
    console.log("[Upload file error]: ", e);
    return Promise.reject(e);
  }
};

export default Upload;
