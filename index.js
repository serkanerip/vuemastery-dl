require("dotenv").config();
const app = require("./src/app");
const courses = require("./courses");

app.run(courses);
