const delay = require("delay");
const puppeteer = require("puppeteer");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

const login = require("./login");
const getCourseVideoListComplete = require("./getCourseVideoListComplete");

const run = async (courses) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await login(page, process.env.EMAIL, process.env.PASSWORD);
  for (let index = 0; index < courses.length; index++) {
    try {
      await getCourseVideoListComplete(page, courses[index]);
    } catch (err) {
      console.log(err);
    }
  }

  console.log("Closing browser.");
  await browser.close();
  console.log("Browser closed.");
};

module.exports = {
  run,
};
