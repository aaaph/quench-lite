const express = require("express");
const router = express();

const models = require("../../models");
const jwt = require("../../lib/jwt");
const fb = require("../../lib/facebookAPI");

const getPage = async (req, res, next) => {
  const token = req.user.facebook_access_token,
    pageId = req.params.pageId;
  const page = await fb.getPage(pageId, token);
  if (page.error) {
    next({ ...page.error, ...{ status: 400 } });
  }
  req.page = page;
  next();
};

router.get("/test", async (req, res, next) => {
  res
    .status(200)
    .send((await models.attributeType.findAll()).map(item => item.value));
});

router.get("/", async (req, res, next) => {
  const token = req.user.facebook_access_token;
  const id = req.user.facebook_id;
  const response = await fb.getPages(id, token);
  const pages = response.data;
  res.status(200).send(pages);
  //this point for geting all pages from auth user
});
router.get("/:pageId", getPage, async (req, res, next) => {
  res.status(200).send(req.page);
});
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
  const album = await fb.getAlbum(target.id, req.user.facebook_access_token);
  res.status(200).send(album);
});
router.get("/:pageId/images/:photoId", getPage, async (req, res, next) => {
  const id = req.params.photoId;
  const images = await fb.getImages(id, req.user.facebook_access_token);
  res.status(200).send(images);
});

module.exports = router;
