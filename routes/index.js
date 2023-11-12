const express = require("express");
const indexRouter = express.Router();
const studentRouter = require("./studentRouter");
const courseRouter = require("./courseRouter");
const teacherRouter = require("./teacherRouter");

indexRouter.use("/students", studentRouter);
indexRouter.use("/courses", courseRouter);
indexRouter.use("/teachers", teacherRouter);

module.exports = indexRouter;
