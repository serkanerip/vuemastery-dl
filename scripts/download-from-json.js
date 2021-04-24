const fs = require("fs");
const downloadVideos = require("../src/downloadVideos");

let filename = process.argv[2] || "videos.json";

videos = JSON.parse(fs.readFileSync(__dirname + "/../" + filename));

!(async () => {
  await downloadVideos(videos);
})();
