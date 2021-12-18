const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cliProgress = require("cli-progress");
const { performance } = require("perf_hooks");

Object.defineProperty(Array.prototype, "chunk_inefficient", {
  value: function (chunkSize) {
    var array = this;
    return [].concat.apply(
      [],
      array.map(function (elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  },
});

const downloadVideo = async (url, path) => {
  const writer = fs.createWriteStream(path);
  try {
    const { data } = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    data.pipe(writer);
  } catch (err) {
    console.log("");
    console.log("error while downloading " + url);
    process.exit(-1);
    console.log(err.response.data);
  }

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

module.exports = async (videos) => {
  var start = performance.now();

  let chunks = videos.chunk_inefficient(process.env.CHUNKS || 5);
  let promises = [];
  const bar1 = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  console.log(
    `${videos.length} video will be downloaded in ${chunks.length} chunks.`
  );
  let finishedChunks = 0;
  bar1.start(chunks.length, finishedChunks);
  for (let index = 0; index < chunks.length; index++) {
    let chunk = chunks[index];
    promises = [];
    for (let i = 0; i < chunk.length; i++) {
      let video = chunk[i];
      let dir = path.join(
        __dirname,
        "..",
        "downloads",
        video.filename.split("/")[0]
      );
      fse.ensureDir(dir);
      let filename = video.filename.substr(
        video.filename.search("/") + 1,
        video.filename.length
      );

      promises.push(
        downloadVideo(video.url, dir + "/" + filename.replace("/", "-"))
      );
    }

    await Promise.all(promises);
    bar1.update(++finishedChunks);
  }
  bar1.stop();
  const elapsedSec = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`${videos.length} video downloaded in ${elapsedSec} seconds`);
};
