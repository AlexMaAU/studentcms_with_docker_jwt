const Teacher = require("../models/teacherModel");
const Course = require("../models/courseModel");
const {
  teacherValidateSchema,
  updateTeacherValidateSchema,
} = require("../utils/validate/teacherValidate");

const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().exec();
    if (!teachers) {
      return res.status(404).json({ error: "teacher not found" });
    }
    res.status(200).json({ data: teachers });
  } catch (error) {
    next(error);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findById(teacherId).exec();
    if (!teacher) {
      return res.status(404).json({ error: "teacher not found" });
    }
    res.status(200).json({ data: teacher });
  } catch (error) {
    next(error);
  }
};

const createTeacher = async (req, res, next) => {
  try {
    const { firstName, lastName, email, courses } = req.body;
    const validBody = await teacherValidateSchema.validateAsync({
      firstName,
      lastName,
      email,
      courses,
    });
    const newTeacher = await new Teacher(validBody).save();
    if (!newTeacher) {
      return res.status(404).json({ error: "teacher not found" });
    }
    // 创建了学生以后，如果courses不为空，那么还需要给Course model下也加上teacher的数据
    // 因为这里是双向绑定
    if (courses) {
      await Course.updateMany(
        { _id: { $in: courses } },
        { $addToSet: { teachers: newTeacher._id } }
      );
    }
    res.status(201).json({ data: newTeacher });
  } catch (error) {
    next(error);
  }
};

const updateTeacherById = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { firstName, lastName, email, courses } = req.body;
    const validBody = await updateTeacherValidateSchema.validateAsync({
      firstName,
      lastName,
      email,
      courses,
    });
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      validBody,
      { new: true }
    ).exec();
    if (!updatedTeacher) {
      return res.status(404).json({ error: "teacher not found" });
    }
    // 更新了教师以后，如果courses不为空，那么还需要给Course model下也更新teacher的数据
    if (courses) {
      // 找出所有以前和该教师相关的课程
      const previousCourses = await Course.find({ teachers: teacherId });
      // 更新之前相关课程，将该学生的ID从students数组中移除
      for (const previousCourse of previousCourses) {
        previousCourse.teachers.pull(teacherId);
        await previousCourse.save();
      }
      // 更新相关课程，将该学生的ID添加到students数组中
      await Course.updateMany(
        { _id: { $in: courses } },
        { $addToSet: { teachers: teacherId } }
      );
    }
    res.status(201).json({ data: updatedTeacher });
  } catch (error) {
    next(error);
  }
};

const deleteTeacherById = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId).exec();
    if (!deletedTeacher) {
      return res.status(404).json({ error: "teacher not found" });
    }
    // 删除该教师，需要把Course里的教师数据也一并删除
    const courses = await Course.find({ teachers: teacherId });
    const courseIds = courses.map((course) => course._id);

    // 使用 updateMany 批量更新相关课程的教师记录
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $pull: { teachers: teacherId } }
    );
    
    res.status(200).json({ data: deletedTeacher });
  } catch (error) {
    next(error);
  }
};

// add course to Teacher model + add Teacher to Course model
const addCourseToTeacher = async (req, res, next) => {
  try {
    const { teacherId, courseId } = req.params;
    const teacher = await Teacher.findById(teacherId)
      .populate("courses")
      .exec();
    const course = await Course.findById(courseId).exec();
    if (!teacher || !course) {
      return res.status(404).json({ error: "Teacher or Course not found" });
    }
    teacher.courses.addToSet(courseId);
    await teacher.save();
    course.teachers.addToSet(teacherId);
    await course.save();
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// delete course from Teacher model + delete Teacher from Course model
const deleteCourseFromTeacher = async (req, res, next) => {
  try {
    const { teacherId, courseId } = req.params;
    const teacher = await Teacher.findById(teacherId)
      .populate("courses")
      .exec();
    const course = await Course.findById(courseId).exec();
    if (!teacher || !course) {
      return res.status(404).json({ error: "Teacher or Course not found" });
    }
    teacher.courses.pull(courseId);
    await teacher.save();
    course.teachers.pull(teacherId);
    await course.save();
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacherById,
  deleteTeacherById,
  addCourseToTeacher,
  deleteCourseFromTeacher,
};
