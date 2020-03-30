const puppeteer = require("puppeteer");
const path = require("path");
const https = require("https");
const fs = require("fs");
const request = require("superagent");
import Upload from "../utils/upload";
import getVIN from "../utils/getVIN";
import { Page } from "puppeteer";

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

const loginPath = "https://api.manheim.com/auth/authorization";

export async function Login(page: Page) {
  try {
    console.log("login start");
    await page.waitFor("#user_username");
    await page.waitFor("#user_password");
    await page.type("#user_username", "rdlexport");
    await page.type("#user_password", "8letters");
    await page.click("#submit");
    console.log("login finished!");
  } catch (e) {
    console.log(e, "==");
    return Promise.reject(e);
  }
}

export function isLogin(url: string): boolean {
  return url.indexOf(loginPath) > -1;
}

export async function handleLogin(page: Page) {
  try {
    isLogin(page.url()) && (await Login(page));
  } catch (e) {
    console.log("[handleLogin]: ", e);
    return Promise.reject(e);
  }
}

export async function flow1(page: any) {
  try {
    await page.waitFor("label[for=presenter_import_type_vin]");
    await page.click("label[for=presenter_import_type_vin]");
    await page.type("#presenter_vin", await getVIN());
    await page.click("#wizard_goto_step_2_button");
    await page.waitForNavigation();
  } catch (e) {
    console.log("[flow 1 error]: ", e);
    return Promise.reject(e);
  }
}

export async function flow2(page: any) {
  try {
    await page.waitFor("#listing_trim_id");
    
    await page.waitForNavigation();
  } catch (e) {
    console.log("[flow 2 error]: ", e);
    return Promise.reject(e);
  }
}

export const flow = [flow1, flow2];
