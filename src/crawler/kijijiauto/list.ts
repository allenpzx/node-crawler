const puppeteer = require("puppeteer");
const fs = require("fs")
const path = require("path")

type Item = {
  url: string,
  matching_results: number,
  year: string,
  make: string,
  model: string,
  vehicle_id: string,
  odometer: string,
  odometer_unit: string,
  current_price: number,
  currency: string,
}

async function crawling() {
  let errCount = 0
  const browser = await puppeteer.launch({ devtools: true });
  let makeNames = await getMakeModel(browser)
  while(makeNames.length && makeNames.length > 0) {
    const makeName = makeNames[0]
    if (makeName && makeName.name) {
      try {
        await crawlByMakeModel(browser, makeName.name)
        makeNames.shift()
      } catch(e) {
        if (errCount > 2) {
          await browser.close()
          return Promise.reject(e)
        } else {
          errCount++
        }
      }
    }
  }
  await browser.close()
  return Promise.reject('success')
}

async function crawlByMakeModel(browser, makeName: string) {
  const inputSelector = 'input[data-testid="FilterMakeModelInput"]'
  const loadMoreSelector = 'button[data-testid="loadMoreButton"]'
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  addRequestFilter(page)
  await page.goto("https://www.kijijiautos.ca/cars/#od=down&sb=ct", {waitUntil: 'domcontentloaded'});
  const inputIsExist = await elementIsExist(page, inputSelector)
  if (inputIsExist) {
    await inputMakeName(page, inputSelector, makeName)
    const response1 = await page.waitForResponse(response => response.url().includes('/consumer/srp/by-params'))
    const {results, numResultsTotal: newNumResultsTotal, offset: newOffset} = await parseResponse(response1)
    await saveResults(path.resolve(__dirname, 'result.txt'), results)
    await printLog(page, {newNumResultsTotal, newOffset, results, model: makeName})
    let loadMoreIsExist = await elementIsExist(page, loadMoreSelector)
    while (loadMoreIsExist) {
      await clickElement(page, loadMoreSelector)
      const response2 = await page.waitForResponse(response => response.url().includes('consumer/svc/s'))
      const {results, numResultsTotal: newNumResultsTotal, offset: newOffset} = await parseLoadMore(response2)
      await saveResults(path.resolve(__dirname, 'result.txt'), results)
      await printLog(page, {newNumResultsTotal, newOffset, results, model: makeName})
      loadMoreIsExist = await elementIsExist(page, loadMoreSelector)
    }
    await page.close()
  } else {
    const msg = `element: ${inputSelector} 不存在`
    console.log(msg)
    return Promise.reject({msg})
  }
}

async function getMakeModel(browser) {
  const page = await browser.newPage();
  await page.goto("https://www.kijijiautos.ca/cars/#od=down&sb=ct", {waitUntil: 'domcontentloaded'});
  await page.waitForResponse(response => response.url().includes('consumer/srp/by-url'));
  const resultStr = await page.evaluate(() => {
    const {INITIAL_STATE: {referenceData: {makeModelTree}}} = window as any
    const {makes: {all}, models} = makeModelTree
    return JSON.stringify({all, models})
  })
  const {all, models} = JSON.parse(resultStr)
  const makeModels = []
  all.map(make => {
    const {i} = make
    models[i].map(model => makeModels.push({make, model}))
  })
  await page.close()
  return makeModels.map(item => ({name: `${item.make.n} ${item.model.n}`}))
}

async function elementIsExist(page, selector: string) {
  try {
    await page.waitForSelector(selector)
    return true
  } catch (e) {
    const {name} = e
    if (name && name === "TimeoutError"){
      return false
    } else {
      return Promise.reject(e)
    }
  }
}

async function inputMakeName(page, selector, makeName: string) {
  await page.hover(selector)
  await page.click(selector, {clickCount: 3})
  await page.waitFor(1000)
  await page.type('input[data-testid="FilterMakeModelInput"]', makeName)
  await page.waitFor(1000)
  await page.keyboard.press('Enter');
}

async function parseResponse(response) {
  const json = await response.json()
  const { listings: { numResultsTotal: matching_results, items, numResultsTotal, offset } } = json
  const results: Item[] = mapToResults(matching_results, items)
  return {results, numResultsTotal, offset}
}

function mapToResults(matching_results, items) {
  const results: Item[] = items.map(item => {
      const {odometer, odometer_unit} = parseMl(item.attr.ml)
      const {attr: {yc: year = ''}} = item
      const {make, model, id: vehicle_id} = item
      const {prices: {consumerPrice: {amount: current_price = '', currency: currency = ''} = ''} = ''} = item
      return {
        url: '/cars/#od=down&sb=ct',
        matching_results,
        year,
        make,
        model,
        vehicle_id,
        odometer,
        odometer_unit,
        current_price,
        currency,
      }
  })
  return results
}

function parseMl(ml: string) {
  let [odometer, odometer_unit] = ml.split(' ')
  odometer = odometer.replace(',', '')
  return {
      odometer,
      odometer_unit,
  }
}

async function saveResults(filePath, results: Item[]) {
  try {
    if (results.length && results.length > 0) {
      for(let item of results) {
        await appendFile(filePath, JSON.stringify(item) + '\n')
      }
    }
  } catch (e) {
    console.log(`appendFile error`)
    console.log(e)
  }
}

function appendFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, content, (err) => {
      if (err) reject(err);
      resolve('success')
    });
  })
}

async function printLog(page, {newNumResultsTotal, newOffset, results, model}) {
  const { JSHeapUsedSize } = await  page.metrics()
  newNumResultsTotal ? console.log(`当前总数: ${newNumResultsTotal}`) : ''
  newOffset ? console.log(`当前offset: ${newOffset}`) : ''
  model ? console.log(`当前车型: ${model}`) : ''
  console.log(`当前页面内存: ${JSHeapUsedSize}s`)
  console.log(results)
}

async function clickElement(page, selector: string) {
  await page.hover(selector)
  await page.click(selector)
}

async function parseLoadMore(response) {
  const json = await response.json()
  const { numResultsTotal: matching_results, items, numResultsTotal, offset} = json
  const results: Item[] = mapToResults(matching_results, items)
  return {results, numResultsTotal, offset}
}

function addRequestFilter(page) {
  page.on('request', request => {
    const url = request.url()
    if (request.url().indexOf('en_US/fbevents.js') > -1 ) {
      request.abort();
    } else if (url.endsWith('.jpg') || url.endsWith('.woff2') || url.endsWith('.svg') || url.endsWith('.woff')) {
      request.abort();
    } else {
      request.continue()
    }
  });
}

export default function kijijiauto(models) {
  crawling().then(value => {
      console.log("====="+value);
  }).catch((e) => {
      console.log(e)
  })
}
