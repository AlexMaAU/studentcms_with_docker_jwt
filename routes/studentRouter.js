const express = require("express");
const studentRouter = express();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudentById,
  deleteStudentById,
  addCourseToStudent,
  deleteCourseFromStudent,
} = require("../controllers/studentController");

studentRouter.get("/", getAllStudents);

studentRouter.get("/:studentId", getStudentById);

studentRouter.post("/", createStudent);

studentRouter.put("/:studentId", updateStudentById);

studentRouter.delete("/:studentId", deleteStudentById);

studentRouter.put("/:studentId/courses/:courseId", addCourseToStudent);

studentRouter.delete("/:studentId/courses/:courseId", deleteCourseFromStudent);

module.exports = studentRouter;
