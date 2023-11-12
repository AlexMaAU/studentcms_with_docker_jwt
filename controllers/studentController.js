const { any } = require("joi");
const Student = require("../models/studentModel");
const Course = require("../models/courseModel");
const {
  studentSchemaValidate,
  updateStudentSchemaValidate,
} = require("../utils/validate/studentValidate");

/**
 * 把异常传递给next中间件进行统一处理
 *
 * 第一种办法：创建一个新的middleware, 导出catchAll()函数。在router文件中导入catchAll()，给每个router的路由处理函数都用catchAll()包裹起来
 * function catchAll(routeHandler) {
 *  //middleware function
 *  return (req, res, next) => {
 *    try {
 *      routeHandler(req, res, next);
 *    } catch(error) {
 *      //错误统一交给error handling middleware处理
 *      next(error);  // pass to error middleware
 *    }
 *  }
 * }
 *
 * 第二种办法：使用 express-async-errors 库，在express层面进行异常处理
 * 在入口文件中，导入 express 之后就紧接导入 express-async-errors
 */

const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().exec();
    if (!students) {
      return res.status(404).json({ error: "student not found" });
    }
    res.status(200).json({ data: students });
  } catch (error) {
    next(error);
  }

  // 使用了express-async-errors，就不需要再用try catch来处理
  // const students = await Student.find().exec();
  // res.json(students);
};

const getStudentById = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).exec();
    if (!student) {
      return res.status(404).json({ error: "student not found" });
    }
    res.status(200).json({ data: student });
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, courses } = req.body;
    const validBody = await studentSchemaValidate.validateAsync({
      firstName,
      lastName,
      courses,
    });
    //开发的时候，创建新文档建议使用以下的方式，而不是.create()
    //原因是不需要去看req.body里会返回什么样的数据，也不会直接使用req.body的参数，而是结构赋值新的数据，不会影响原有数据
    //也不要直接把req.body作为参数直接传入，这样很危险。应该通过解构赋值，选取我们需要的数据，比如req.body中有些参数是不应该人工设置的，这时就不需要解构出来
    const newStudent = await new Student(validBody).save();
    // 创建了学生以后，如果courses不为空，那么还需要给Course model下也加上student的数据
    // 因为这里是双向绑定
    if (courses) {
      await Course.updateMany(
        { _id: { $in: courses } },
        { $addToSet: { students: newStudent._id } }
      );
    }
    res.status(201).json({ data: newStudent });
  } catch (error) {
    next(error);
  }
};

//这里的学生信息更新方式，是每次都要直接更新整个的学生信息内容
//如果把给学生添加课程和移除课程的操作也放在这个endpoint进行，那么每次更新学生都需要把整个courses都重新覆盖一次，这样很不合理。
//而且每个学生对应多个Course，一般遇到 1：N 的情况，都会再设置一层路径，把endpoint单独分开
// 比如：PUT /students/:studentId/courses/:courseId
// /students/:studentId 确定是哪个学生
// /courses/:courseId 确定这个学生下的哪个课程
const updateStudentById = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { firstName, lastName, courses } = req.body;
    const validBody = await updateStudentSchemaValidate.validateAsync({
      firstName,
      lastName,
      courses,
    });
    //.findByIdAndUpdate()中第三个参数{new:true}表示返回的是更新后的值，如果不加，则默认返回更新之前的数据
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      validBody,
      { new: true }
    ).exec();
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    // 更新了学生以后，如果courses不为空，那么还需要给Course model下也更新student的数据
    if (courses) {
      // 找出所有以前和该学生相关的课程
      const previousCourses = await Course.find({ students: studentId });
      // 更新之前相关课程，将该学生的ID从students数组中移除
      for (const previousCourse of previousCourses) {
        previousCourse.students.pull(studentId);
        await previousCourse.save();
      }
      // 更新相关课程，将该学生的ID添加到students数组中
      await Course.updateMany(
        { _id: { $in: courses } },
        { $addToSet: { students: studentId } }
      );
    }
    res.status(201).json({ data: updatedStudent });
  } catch (error) {
    next(error);
  }
};

const deleteStudentById = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(studentId).exec();
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    // 删除该学生，需要把Course里的学生数据也一并删除
    const courses = await Course.find({ students: studentId });
    const courseIds = courses.map((course) => course._id);

    // 使用 updateMany 批量更新相关课程的学生记录
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $pull: { students: studentId } }
    );

    res.status(201).json({ data: deletedStudent });
  } catch (error) {
    next(error);
  }
};

// add course to Student model + add student to Course model
const addCourseToStudent = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.params;
    const student = await Student.findById(studentId)
      .populate("courses")
      .exec();
    const course = await Course.findById(courseId).exec();
    if (!student || !course) {
      return res.status(404).json({ error: "Student or Course not found" });
    }
    student.courses.addToSet(courseId);
    await student.save();
    course.students.addToSet(studentId);
    await course.save();
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};
// delete course from Student model + delete course from Student model
const deleteCourseFromStudent = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.params;
    const student = await Student.findById(studentId)
      .populate("courses")
      .exec();
    const course = await Course.findById(courseId).exec();
    if (!student || !course) {
      return res.status(404).json({ error: "Student or Course not found" });
    }
    student.courses.pull(courseId);
    await student.save();
    course.students.pull(studentId);
    await course.save();
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudentById,
  deleteStudentById,
  addCourseToStudent,
  deleteCourseFromStudent,
};
