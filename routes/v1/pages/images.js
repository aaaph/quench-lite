const express = require("express");
const router = express.Router();

const fb = require("../../../lib/facebookAPI");

router.get("/:photoId", async (req, res, next) => {
  const id = req.params.photoId;
  const images = await fb
    .getImages(id, req.user.facebook_access_token)
    .catch(err => {
      next({ ...err, ...{ status: 400 } });
      return;
    });
  if (images) {
    res.status(200).send(images);
  }
});

module.exports = router;
