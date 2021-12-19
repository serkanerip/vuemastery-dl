const delay = require("delay");
const cliProgress = require("cli-progress");

module.exports = async (page, courseURL) => {
  const delayInMS = 5000;
  let videos = [];
  await page.goto(courseURL, {
    waitUntil: "networkidle2",
  });
  await delay(delayInMS);

  const courseTitle = (await page.evaluate(
    () => document.querySelector("h2.title").textContent
  )).replace(/[/\\?%*:|"<>]/g, '-');
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
  
    const classes =  item._remoteObject.description;
    if (classes.includes("draft")) {
      console.log("skipping video because its a draft")
      continue;
    }

    if (classes.includes("-locked")) {
      console.log("skipping video because its locked you dont have permission")
      continue;
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

    const content = await page.evaluate(() => document.body.innerText);
    let newString = content.split(`progressive":[`)[1];
    if (!newString) {
      console.log(
        `\nRetrying fetch ${index + 1}. video(${videoTitle}) of ${courseTitle}`
      );
    }
    let finString = newString.split(']},"lang":"en","sentry":')[0];
    let videoVariations = await eval(`[${finString}]`);

    let selectedVideo = await videoVariations.find(
      (vid) => vid.quality === process.env.VIDEO_QUALITY
    );

    selectedVideo.filename = `${courseTitle}/${courseTitle} - ${index + 1}-${videoTitle}.mp4`;

    let newStringSubtitles = content.split(`"text_tracks":[{`)[1].split(`"lang":"en","url":"`)[1];
    let finStringSubtitles = "";
    selectedVideo.urlSubtitles = "";
    selectedVideo.filenameSubtitles = "";
    if (!newStringSubtitles) {
      console.log(
        `\nNo subtitles for video(${videoTitle}) of ${courseTitle}`
      );
    } else {
      finStringSubtitles = newStringSubtitles.split(`","kind":"captions"`)[0];
      selectedVideo.urlSubtitles = `https://player.vimeo.com${finStringSubtitles}`;
      selectedVideo.filenameSubtitles = `${courseTitle}/${courseTitle} - ${index + 1}-${videoTitle}.vtt`;
    }

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
