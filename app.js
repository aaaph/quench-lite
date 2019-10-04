const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressSession = require("express-session");

const cors = require("cors");

const passport = require("passport");
const jwt = require("passport-jwt");

const indexRouter = require("./routes/index");

const app = express();
const corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"]
};
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corsOption));
app.use(
  expressSession({
    secret: "kasik",
    resave: true,
    saveUninitialized: true
  })
);
app.use("/api", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log(err);

  switch (err.name) {
    case "SequelizeValidationError":
      err.status = 400;
  }
  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
