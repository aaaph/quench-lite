const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressSession = require("express-session");

const passport = require("passport");
const jwt = require("passport-jwt");

const indexRouter = require("./routes/index");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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

passport.serializeUser((user, cb) => {
  console.log(user, cb);
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  console.log(obj, cb);
  cb(null, obj);
});
app.use(passport.initialize());
app.use(passport.session());
let opts = {
  jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "kasik"
};
passport.use(
  new jwt.Strategy(opts, (jwtPayload, done) => {
    console.log(jwtPayload);
    let expirationDate = new Date(jwtPayload.exp * 1000);
    if (expirationDate < new Date()) {
      return done(null, false);
    }
    let user = jwtPayload;
    done(null, user);
  })
);
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
