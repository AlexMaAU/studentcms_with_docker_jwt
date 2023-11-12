const Course = require("../models/courseModel");
const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");
const {
  courseValidateSchema,
  updateCourseValidateSchema,
} = require("../utils/validate/courseValidate");

//不管是request还是validate，都可能会出现错误，所以需要设置错误处理机制
//以下是常见的错误处理方式 - 异步请求错误处理机制
/*
1. callback形式 - err只会处理当前请求的错误，所以每个回调函数都需要写一次错误处理。所以这种形式目前已经很少用了。
Course.find().exec((err,data)=>{  //服务请求执行的时候直接在callback中处理
    if(err) {  //如果有错误
        res.status(500).json({error:'something went wrong'})
        return
    }
    res.json(data)
})

2. promise
Course.find().exec().then((data)=>{
    res.json(data)
}).catch((err)=>{
    res.status(500).json({error:'something went wrong'})
})

3. async/await语法 - catch()会统一处理try()里的所有错误，如果内部有多个异步请求，无法很好的分辨出哪个请求出错了，如果有必要，需要对特定请求单独嵌套try catch
try {
    const courses = await Course.find().exec()
} catch(error) {
    console.log(error)
    res.status(500).json({error:'something went wrong'})
}
*/

const getAllCourses = async (req, res, next) => {
  // 使用 try catch 在代码块内进行异常处理
  // 但是存在重复代码，那么也可以直接把异常传递给next中间件进行统一处理
  try {
    //populate多个属性，用数组[]形式传入，比如 .populate(['students', 'teachers'])
    const courses = await Course.find().exec();
    if (!courses) {
      return res.status(404).json({ error: "course not found" });
    }
    res.status(200).json({ data: courses });
  } catch (error) {
    // 错误 catch 到以后在代码块内处理
    console.error(error); //实际开发不会用console.error，会用winston等第三方包
    res.status(500).json({ error: "something went wrong" });
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).exec();
    if (!course) {
      return res.status(404).json({ error: "course not found" });
    }
    res.status(200).json({ data: course });
  } catch (error) {
    next(error); //错误统一交给error handling middleware处理
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, description, students, teachers } = req.body;
    //model中一般只做最基本的数据类型验证
    //其他复杂的数据验证会单独进行设置
    //可以把验证部分单独提取出来放在一个文件里，这样就可以共用代码
    /*
    验证方法三：
    const schema = joi.object({
        name:joi.string().min(2).max(10).required(),
        description:joi.string().min(5).max(100).optional(),
        code:joi.string().regex(/^{a-zA-Z0-9}+$/).message('Invalid code format').required()
    })
    */
    //validateAsync里可以单独传入{name,description,code}
    //如果为了简单，也可以直接使用req.body。但是因为req.body直接赋值会比较危险，这时可以后面加上参数 {allowUnknown:true, stripUnknown:true}
    //{allowUnknown:true, stripUnknown:true} 表示可以往验证数据里添加不认识的属性，但是最后会把不认识的属性都删掉
    const validBody = await courseValidateSchema.validateAsync({
      name,
      description,
      students,
      teachers,
    }); //验证成功，返回数据对象，失败则返回错误对象
    const newCourse = await new Course(validBody).save();
    res.status(201).json({ data: newCourse });
  } catch (error) {
    next(error);
  }
};

const updateCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { name, description, students, teachers } = req.body;
    const validBody = await updateCourseValidateSchema.validateAsync({
      name,
      description,
      students,
      teachers,
    });
    const updatedCourse = await Course.findByIdAndUpdate(courseId, validBody, {
      new: true,
    }).exec();
    if (!updatedCourse) {
      return res.status(404).json({ error: "course not found" });
    }
    res.status(201).json({ data: updatedCourse });
  } catch (error) {
    next(error);
  }
};

const deleteCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(courseId).exec();
    if (!deletedCourse) {
      return res.status(404).json({ error: "course not found" });
    }
    //注意：因为目前model里course和student还有teacher之间是双向绑定的，如果只把course从数据库中删除，但是student和teacher文档下的course关联不会被删除，需要手动处理
    //delete course from studentModel
    await Student.updateMany(
      // 这是更新操作的第一个参数，它指定了要更新哪些学生记录。这里使用了一个查询条件，即查找具有 courses 属性包含特定 id 值的学生记录。
      { courses: courseId },
      // 这是更新操作的第二个参数，它定义了要对匹配的记录执行的操作。在这里，使用了 $pull 操作符，它的作用是从 courses 数组中删除指定的 id 值。
      {
        $pull: {
          courses: courseId,
        },
      }
    );
    //delete course from teacherModel
    await Teacher.updateMany(
      { courses: courseId },
      {
        $pull: {
          courses: courseId,
        },
      }
    );
    res.status(200).json({ data: deletedCourse });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  deleteCourseById,
};
