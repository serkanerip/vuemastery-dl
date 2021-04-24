const delay = require("delay");

module.exports = async (page, email, password) => {
  console.log("Trying to login...");

  page.goto("https://www.vuemastery.com/", { waitUntil: "networkidle2" });
  await page.waitForSelector('button[data-test="loginBtn"]');

  await page.click('button[data-test="loginBtn"]');
  await page.focus('input[placeholder="Account Email"]');
  await page.keyboard.type(email);
  await page.focus('input[placeholder="Password"]');
  await page.keyboard.type(password);

  await page.click('button[class="button primary -full"]');
  await page.click('button[class="button primary -full"]');
  await delay(2000);

  console.log("Login success!");
};
