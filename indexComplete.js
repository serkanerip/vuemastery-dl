require("dotenv").config();
const appComplete = require("./src/appComplete");
const courses = require("./courses");

appComplete.run(courses);
