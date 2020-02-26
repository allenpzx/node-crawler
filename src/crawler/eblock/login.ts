export {};
export async function Login(page) {
  try {
    await page.waitFor(
      "main[class^=main] form[class^=authForm] button[type^=submit]"
    );
    await page.type(
      "main[class^=main] form[class^=authForm] input[name=username]",
      "George"
    );
    await page.type(
      "main[class^=main] form[class^=authForm] input[name=password]",
      "Barryangst1"
    );
    await page.click(
      "main[class^=main] form[class^=authForm] button[type^=submit]"
    );
    await page.waitForNavigation()
  } catch (error) {
    console.log("eblock login error: ", error);
  }
}

const loginUrl = `https://app.eblock.com/auth/login`;
export const isLoginPage = (page) => page.url() === loginUrl;
