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

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log(err);
  /*
  switch (err.name) {
    case "SequelizeValidationError":
      err.status = 400;
  }*/
  res.status(err.status || 500).send(err.message);
  res.end();
});

module.exports = app;
