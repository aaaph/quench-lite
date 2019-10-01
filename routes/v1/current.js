const express = require("express");
const router = express.Router();

const models = require("../../models");
const jwt = require("../../lib/jwt");

const verify = async (req, res, next) => {
  const token = req.headers.accesstoken;
  const payload = await jwt.getPayload(token).catch(err => {
    next({ ...err, ...{ status: 401 } });
  });
  req.access = payload;
  next();
};

const getUser = async (req, res, next) => {
  const user = await models.user
    .findByPk(req.access.id)
    .catch(err => next({ ...err, ...{ status: 400 } }));
  if (!user) {
    next({ ...{ status: 204 } });
  }
  req.user = user;
  next();
};
router.get("/", verify, getUser, async (req, res, next) => {
  res.status(200).send(req.user);
});
router.delete("/delete", verify, getUser, async (req, res, next) => {
  await models.refreshToken
    .destroy({ where: { userId: req.user.id } })
    .catch(err => next(err));
  await req.user.destroy().catch(err => next(err));
  res.status(204).send("destroyed");
});

module.exports = router;
