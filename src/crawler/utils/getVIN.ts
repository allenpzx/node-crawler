const puppeteer = require("puppeteer");

interface IProps {
    (type?: 'fake' | 'real'): Promise<any>;
}

const getVIN: IProps = async (type = 'fake') => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const vin = await new Promise(async (resolve, reject) => {
        await page.on('response', async function (response) {
            if(response.url().indexOf('/getvin.php?type=') > -1) {
                if(response.status() === 200) {
                    return resolve(await response.text())
                }
                return reject()
            }
        })
        await page.goto('https://randomvin.com/')
        await page.click(type === 'fake' ? '[name="mk_vin"]' : '[name="mk_real_vin"]')
    })

    await browser.close();
    return vin
  } catch (e) {
    console.log("get vin error: ", e);
  }
}

export default getVIN;
