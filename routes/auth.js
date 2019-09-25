const express = require("express");
const router = express.Router();

const models = require("../models");

router.get("/", async (req, res, next) => {
  const users = await models.user.findAll();
  res.status(200).send(users);
});
const getUser = async (req, res, next) => {
  const user = await models.user
    .findByPk(req.params.id)
    .catch(err => next(Object.assign(err, { status: 400 })));
  if (!user) {
    const err = {
      message: "User with id not found",
      status: 204
    };
    await next(err);
  }
  req.user = user;
  await next();
};
router.get("/:id", getUser, async (req, res, next) => {
  res.status(200).send(req.user);
});
router.post("/create", async (req, res, next) => {
  const obj = {
    email: req.body.email,
    facebook_id: req.body.facebook_id,
    facebook_access_token: req.body.facebook_access_token
  };
  const user = await models.user.create(obj).catch(err => {
    next(err);
  });
  res.status(201).send(user);
});
router.patch("/:id/update", getUser, async (req, res, next) => {
  const obj = {
    email: req.body.email,
    facebook_id: req.body.facebook_id,
    facebook_access_token: req.body.facebook_access_token
  };
  const updated = await req.user.update(obj).catch(err => {
    next(err);
  });
  res.status(200).send(updated);
});
router.delete("/:id/delete", getUser, async (req, res, next) => {
  await req.user.destroy().catch(err => next(err));
  res.status(204).send("success");
});

module.exports = router;
