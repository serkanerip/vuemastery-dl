require("dotenv").config();
const app = require("./src/app");
const courses = require("./courses");

const type = process.argv[2] || "all";

app.run(courses, type);
