const express = require("express");
const router = express.Router();

const fb = require("../../../lib/facebookAPI");

router.get("/", async (req, res, next) => {
  const albums = await fb.getAlbums(
    req.page.id,
    req.user.facebook_access_token
  );
  res.status(200).send(albums);
});

router.get("/:albumId", async (req, res, next) => {
  const albums = await fb.getAlbums(
    req.page.id,
    req.user.facebook_access_token
  );
  const id = req.params.albumId;
  const target = albums.find(obj => obj.id == id);
  if (!target) {
    next({
      message: "invalid album id for this page, or album not found",
      status: 400
    });
  }
  const album = await fb.getAlbum(target.id, req.user.facebook_access_token);
  res.status(200).send(album);
});
module.exports = router;
