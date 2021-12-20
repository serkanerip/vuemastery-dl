const delay = require("delay");
const cliProgress = require("cli-progress");
const fse = require("fs-extra");
const path = require("path");

module.exports = async (page, courseURL) => {
  const delayInMS = 5000;
  page.setDefaultNavigationTimeout(50000)
  await page.goto(courseURL, {
    waitUntil: "networkidle2",
  });
  await delay(delayInMS);

  const courseTitle = (await page.evaluate(
    () => document.querySelector("h2.title").textContent
  )).replace(/[/\\?%*:|"<>]/g, '-').replace('w-', 'with');

  console.log(`Fetching ${courseTitle} course complete page.`);
  const bar1 = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  let items = await page.$$("div.list-item");
  let index = 0;
  let item = null;

  bar1.start(items.length, 0);

  for (index; index < items.length; index++) {
    let _items = await page.$$("div.list-item");

    item = _items[index];
    if (item._remoteObject.description.includes("draft")) {
      break;
    }

    await item.click();
    await Promise.all([
      index != 0 ? page.waitForNavigation() : delay(delayInMS),
    ]);
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    await page.waitForSelector("iframe");

    if (item._remoteObject.description.includes("draft")) {
      break;
    }

    const videoTitle = (await page.evaluate(
      () => document.querySelector("h1.title").textContent
    )).replace(/[/\\?%*:|"<>]/g, '-');

    await page.evaluate(
      () => document.querySelectorAll(".announcement-bar").forEach(e => e.remove())
    );

    const content = await page.evaluate(
      () => document.documentElement.innerHTML
    );

    const contentFormatted = content.replaceAll('src="/images/', 'src="https://www.vuemastery.com/images/')

    let fileName = `complete-${courseTitle} - ${index + 1}-${videoTitle}.html`;
    fse.outputFile(
      path.join(
        __dirname,
        "..",
        "downloads",
        courseTitle,
        fileName
      ),
      contentFormatted
    );

    bar1.update(index + 1);
  }

  bar1.stop();
};
