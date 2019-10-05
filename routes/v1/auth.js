const express = require("express");
const router = express.Router();

const models = require("../../models");
const fb = require("../../lib/facebookAPI");
const jwt = require("../../lib/jwt");

router.post("/login", async (req, res, next) => {
  const inputToken = req.body.facebook_access_token;
  const fbUser = await fb.getUser(inputToken);
  console.log(fbUser);
  if (fbUser.error) {
    next({ ...fbUser.error, ...{ status: 400 } });
    return;
  }
  //console.log(fbUser);
  let user = await models.user
    .findOne({ where: { facebook_id: fbUser.id } })
    .catch(err => next(err));
  if (!user) {
    const obj = {
      name: fbUser.name,
      picture: fbUser.picture.data.url,
      email: fbUser.email,
      facebook_id: fbUser.id,
      facebook_access_token: inputToken
    };
    user = await models.user.create(obj).catch(err => next(err));
  }
  const longToken = await fb.generateLongLiveUserAccessToken(inputToken);

  const updatedUser = await user
    .update({ facebook_access_token: longToken.access_token })
    .catch(err => next(err));

  //console.log(updatedUser.dataValues);

  const jwtPair = await jwt.createPair(user.id);
  updatedUser.facebook_access_token = undefined;
  res.status(200).json({ jwt: jwtPair, user: updatedUser });
});
router.post("/check", async (req, res, next) => {
  const token = req.headers.token;

  const payload = jwt.getPayload(token).catch(err => {
    next(err);
    return;
  });
  const user = await models.user.findByPk(payload.id);
  res.status(200).send(user);
});

router.post("/refresh-token", async (req, res, next) => {
  const inputToken = req.headers.refreshtoken;
  const inputPayload = await jwt.getPayload(inputToken).catch(err => {
    next(err);
    return;
  });

  const dbToken = (await models.refreshToken.findOne({
    where: { userId: inputPayload.id }
  })).dataValues.refreshToken;

  await jwt.getPayload(dbToken).catch(err => {
    next(err);
    return;
  });
  if (!(inputToken == dbToken)) {
    next({ message: "invalid refresh token", status: 400 });
    return;
  }
  const pair = await jwt.createPair(payload.id);
  res.status(201).send(pair);
});
module.exports = router;
