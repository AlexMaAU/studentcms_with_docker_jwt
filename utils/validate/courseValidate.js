const joi = require("joi");

const courseValidateSchema = joi.object({
  name: joi.string().min(2).max(255).required(),
  description: joi.string().min(2).max(255).required(),
  students: joi.optional(),
  teachers: joi.optional(),
});

const updateCourseValidateSchema = joi.object({
  name: joi.string().min(2).max(255).optional(),
  description: joi.string().min(2).max(255).optional(),
  students: joi.optional(),
  teachers: joi.optional(),
});

module.exports = { courseValidateSchema, updateCourseValidateSchema };
