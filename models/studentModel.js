const { Schema, model } = require("mongoose");
const joi = require("joi");

const studentSchema = new Schema({
  firstName: {
    type: String,
    required: true, //model内处理，不建议，验证功能还是单独提取出来可读性更好
    minLength: 2,
    maxLength: 255,
  },
  lastName: {
    type: String,
    validate: [
      //表示验证这个字段 - 如果验证规则可能复用，就不要在model下直接写上validate，而是把vallidation单独放到一个文件里，在controller中进行调用验证，参考：courses controller
      {
        /*
          比较古老的验证方法：
          validator: (email)=>{  //有validator属性，对应一个匿名函数，函数内把要验证的字段传入。也就是说，每次validator都会调用匿名函数对email进行验证。
            return /^[a-zA-Z0-9_.+-]+@[a-zA-z0-9]+\.[a-zA-Z0-9]+$/.test(email)  //对email进行正则表达式验证，返回验证true or false
          }
        */
        validator: (lastName) => {
          return (
            // .error === undefined 这句代码的目的是检查验证是否通过，以及是否存在任何验证错误。
            // 在 Joi 中，如果验证通过，.error 属性将是 undefined，这表示没有错误。如果有验证错误，.error 属性将包含有关错误的信息。
            joi.string().min(2).max(255).required().validate(lastName).error ===
            undefined
          );
        },
        msg: "Invalid last name format",
      },
    ],
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const Student = model("Student", studentSchema);

module.exports = Student;
