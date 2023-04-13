// express
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("./public"));
// packages
require("dotenv").config();
require("express-async-errors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// security
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

// apply security
app.use(
  rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 60,
  })
);
app.set("trust proxy", 1);
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(cors());

// database
const connectDB = require("./db/connect");

// routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

// logging middleware
app.use(morgan("tiny"));

// cookie middleware
app.use(cookieParser(process.env.JWT_SECRET));

// require error middleware
const errorHandlerMiddlerware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");

// file upload
app.use(fileUpload());

app.get("/", (req, res) => {
  res.cookie("test", "test");
  console.log(req.cookies);
  res.send(`ecommerce API`);
});

app.get("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send(`ecommerce API`);
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// use error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddlerware);

// port
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("connected to db...");
    app.listen(port, () => {
      console.log(`server listening on port ${port}...`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
