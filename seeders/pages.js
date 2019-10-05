const express = require("express");
const router = express();

const models = require("../models");
const jwt = require("../lib/jwt");
const fb = require("../lib/facebookAPI");

const getPage = async (req, res, next) => {
  const token = req.user.facebook_access_token,
    pageId = req.params.pageId;
  const page = await fb.getPage(pageId, token);
  if (page.error) {
    next({ ...page.error, ...{ status: 400 } });
  }
  req.page = page;
  const addPage = await page
    .findOrCreate({ where: { id: pageId } })
    .catch(err => next(err));
  console.log(addPage);
  next();
};

router.get("/:pageId/albums", getPage, async (req, res, next) => {
  const albums = await fb.getAlbums(
    req.page.id,
    req.user.facebook_access_token
  );
  res.status(200).send(albums);
});

router.get("/:pageId/albums/:albumId", getPage, async (req, res, next) => {
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
router.get("/:pageId/images/:photoId", getPage, async (req, res, next) => {
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
