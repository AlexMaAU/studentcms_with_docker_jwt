const { Schema, model } = require("mongoose");

const teacherSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const Teacher = model("Teacher", teacherSchema);

module.exports = Teacher;
