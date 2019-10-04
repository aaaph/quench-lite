const express = require("express");
const router = express.Router();

const models = require("../../models");
const jwt = require("../../lib/jwt");

const auth = require("./auth");
const users = require("./users");
const pages = require("./pages");
const attr = require("./attributes");

const verify = async (req, res, next) => {
  const token = req.headers.accesstoken;
  const payload = await jwt.getPayload(token).catch(err => {
    next({ ...err, ...{ status: 401 } });
  });
  req.access = payload;
  next();
};

const getUser = async (req, res, next) => {
  const user = await models.user.findByPk(req.access.id);
  //console.log(user);
  req.user = user;
  next();
};

router.use("/auth", auth);
router.use("/users", users);
router.use("/pages", verify, getUser, pages);
router.use("/attributes", verify, getUser, attr);

router.use("/", (req, res, next) => {
  console.log(req.headers);
  res.status(404).send("unused url");
});
module.exports = router;
