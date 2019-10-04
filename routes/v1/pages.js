const express = require("express");
const router = express();

const models = require("../../models");
const jwt = require("../../lib/jwt");
const fb = require("../../lib/facebookAPI");

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

router.get("/", verify, getUser, async (req, res, next) => {
  const token = req.user.facebook_access_token;
  const id = req.user.facebook_id;
  const response = await fb.getPages(id, token);
  const pages = response.data;
  res.status(200).send(pages);
  //this point for geting all pages from auth user
});

module.exports = router;
