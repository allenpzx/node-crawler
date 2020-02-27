export async function Login(page) {
  try {
    await page.waitFor(
      "main[class^=main] form[class^=authForm ] button[type^=submit]"
    );
    await page.type(
      "main[class^=main] form[class^=authForm ] input[name=username]",
      "George"
    );
    await page.type(
      "main[class^=main] form[class^=authForm ] input[name=password]",
      "Barryangst1"
    );
    await page.click(
      "main[class^=main] form[class^=authForm ] button[type^=submit]"
    );
    await page.waitForNavigation();
  } catch (error) {
    console.log("eblock login error: ", error);
  }
}

const loginUrl = `https://app.eblock.com/auth/login`;
export const isLoginPage = page => page.url() === loginUrl;

export const closeModal = async page => {
  try {
    await page.waitFor("#modal-root button[class^=close]");
    await page.click("#modal-root button[class^=close]");
  } catch (e) {
    console.log("close modal error");
    return Promise.reject(e);
  }
};

export const getMileageNumber = (str: string): string => {
  if (!str) return "";
  const regex = /^\d+[0-9\,]+\d/;
  const res = str.match(regex);
  return res ? res[0] : "";
};

export const getMileageUnit = (str: string): string => {
  if (!str) return "";
  const regex = /[a-z]+/;
  const res = str.match(regex);
  return res ? res[0] : "";
};

export const getPriceSymble = (str: string): string => {
  if (!str) return "";
  return str.replace(/\d+.\d+/, "");
};

export const getPriceNumber = (str: string): string => {
  if (!str) return "";
  const regex = /\d+.\d+/;
  const res = str.match(regex);
  return res ? res[0] : "";
};
