const joi = require("joi");

const teacherValidateSchema = joi.object({
  firstName: joi.string().min(2).max(255).required(),
  lastName: joi.string().min(2).max(255).required(),
  email: joi.string().email().required(),
  courses: joi.string().optional(),
});

const updateTeacherValidateSchema = joi.object({
  firstName: joi.string().min(2).max(255).optional(),
  lastName: joi.string().min(2).max(255).optional(),
  email: joi.string().email().optional(),
  courses: joi.string().optional(),
});

module.exports = { teacherValidateSchema, updateTeacherValidateSchema };
