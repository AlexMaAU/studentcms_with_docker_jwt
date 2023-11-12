// 最后一层错误处理中间件
const unknownError = (error, req, res) => {
  console.error("Error occurs");
  res.status(500).send("something went wrong");
};

module.exports = unknownError;
