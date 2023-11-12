// 专门处理validation error的中间件
// 由上级中间件传入的error
// 如果这个中间件处理不了的错误，再传递给下一个中间件，所以需要next
const validateError = (error, req, res, next) => {
  // 通过error.name来判断是否是要处理的错误
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  // 不是就传递给下一个中间件
  next(error);
};

module.exports = validateError;
