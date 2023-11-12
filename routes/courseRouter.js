const express = require("express");
const courseRouter = express();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  deleteCourseById,
} = require("../controllers/courseController");

courseRouter.get("/", getAllCourses);

courseRouter.get("/:courseId", getCourseById);

courseRouter.post("/", createCourse);

courseRouter.put("/:courseId", updateCourseById);

courseRouter.delete("/:courseId", deleteCourseById);

module.exports = courseRouter;
