const delay = require("delay");
const cliProgress = require("cli-progress");

module.exports = async (page, courseURL) => {
  const delayInMS = 5000;
  let videos = [];
  await page.goto(courseURL, {
    waitUntil: "networkidle2",
  });
  await delay(delayInMS);

  const courseTitle = await page.evaluate(
    () => document.querySelector("h2.title").textContent
  );
  console.log(`Fetching ${courseTitle} course videos links.`);
  const bar1 = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  let items = await page.$$("div.list-item");
  let index = 0;
  let item = null;
  let iframeSrc = null;
  let oldIframeSrc = null;

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

    iframeSrc = await page.evaluate(
      () =>
        Array.from(
          document.body.querySelectorAll("iframe[src]"),
          ({ src }) => src
        )[0]
    );

    while (index != 0 && (!iframeSrc || oldIframeSrc == iframeSrc)) {
      await delay(200);
      iframeSrc = await page.evaluate(
        () =>
          Array.from(
            document.body.querySelectorAll("iframe[src]"),
            ({ src }) => src
          )[0]
      );
    }

    if (item._remoteObject.description.includes("draft")) {
      break;
    }

    const videoTitle = await page.evaluate(
      () => document.querySelector("h1.title").textContent
    );

    oldIframeSrc = await page.evaluate(
      () =>
        Array.from(
          document.body.querySelectorAll("iframe[src]"),
          ({ src }) => src
        )[0]
    );

    await Promise.all([
      page.goto("view-source:" + iframeSrc, { waitUntil: "networkidle0" }),
      page.waitForNavigation(),
    ]);

    const content = await page.evaluate(
      () =>
        Array.from(
          document.body.querySelectorAll("td.line-content"),
          (txt) => txt.textContent
        )[0]
    );

    let newString = content.split(`progressive":[`)[1];
    if (!newString) {
      console.log(
        `Retrying fetch ${index + 1}. video(${videoTitle}) of ${courseTitle}`
      );
    }
    let finString = newString.split(']},"lang":"en","sentry":')[0];
    let videoVariations = await eval(`[${finString}]`);

    let selectedVideo = await videoVariations.find(
      (vid) => vid.quality === process.env.VIDEO_QUALITY
    );

    selectedVideo.filename = `${courseTitle}/${courseTitle}-${index}-${videoTitle}.mp4`;
    videos.push(selectedVideo);
    bar1.update(index + 1);

    await Promise.all([
      page.goBack(),
      page.waitForSelector(".list-item"),
      page.waitForNavigation(),
    ]);
  }

  bar1.stop();
  return videos;
};
