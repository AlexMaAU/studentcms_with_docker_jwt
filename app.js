const express = require("express");
//express-async-errors 这个包一定要在导入express后再导入，否则不起作用，专门用来处理异步错误。但是还是需要自定义错误中间件来处理要自定义的错误处理。
require("express-async-errors"); 
const cors = require("cors");
require("dotenv").config();
const connectToDB = require("./utils/db");
const validateError = require("./middlewares/validateError");
const unknownError = require("./middlewares/unkownError");

const indexRouter = require("./routes/index");

const app = express();
const port = process.env.PORT || 4040;

app.use(express.json());
app.use(cors());

app.use("/v1", indexRouter);

// 中间件的执行顺序就是中间件的注册顺序
//其他详细类型的错误处理中间件要在未知错误处理中间件的前面
app.use(validateError);

// 自定义的最后一级错误处理中间件, 当有错误是其他的中间件无法处理的时候，都交由最后一级来处理
app.use(unknownError); //未知错误处理中间件要放在最后面

connectToDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express server running at ${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
