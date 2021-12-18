const fs = require("fs");
const path = require("path");
const downloadVideos = require("../src/downloadVideos");

let filename = process.argv[2] || "videos.json";

videos = JSON.parse(fs.readFileSync(path.join(__dirname, "..", filename)));

!(async () => {
  await downloadVideos(videos);
})();
