const express = require("express");
const teacherRouter = express();
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacherById,
  deleteTeacherById,
  addCourseToTeacher,
  deleteCourseFromTeacher,
} = require("../controllers/teacherController");

teacherRouter.get("/", getAllTeachers);

teacherRouter.get("/:teacherId", getTeacherById);

teacherRouter.post("/", createTeacher);

teacherRouter.put("/:teacherId", updateTeacherById);

teacherRouter.delete("/:teacherId", deleteTeacherById);

teacherRouter.put("/:teacherId/courses/:courseId", addCourseToTeacher);

teacherRouter.delete("/:teacherId/courses/:courseId", deleteCourseFromTeacher);

module.exports = teacherRouter;
