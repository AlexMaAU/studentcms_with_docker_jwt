const joi = require("joi");

const studentSchemaValidate = joi
  .object({
    firstName: joi.string().min(2).max(255).required(),
    lastName: joi.string().min(2).max(255).required(),
    courses: joi.optional(),
  })
  .messages({
    "string.base": "Must be string format",
    "string.min": "Invalid length, 2 min",
    "string.max": "Invalid length, 255 max",
  });

const updateStudentSchemaValidate = joi.object({
  firstName: joi.string().min(2).max(255).optional(),
  lastName: joi.string().min(2).max(255).optional(),
  courses: joi.optional(),
});

module.exports = { studentSchemaValidate, updateStudentSchemaValidate };
