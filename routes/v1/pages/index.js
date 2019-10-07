const express = require("express");
const router = express.Router();

const models = require("../../../models");
const fb = require("../../../lib/facebookAPI");

const getPage = async (req, res, next) => {
  const token = req.user.facebook_access_token,
    pageId = req.params.pageId;
  const page = await fb.getPage(pageId, token);
  if (page.error) {
    next({ ...page.error, ...{ status: 400 } });
  }

  req.page = await assignPage(req, page);
  next();
};
const assignPage = async (req, fbPage) => {
  let dbPage = await models.page.findByPk(fbPage.id);
  if (!dbPage) {
    dbPage = await models.page.create({ id: fbPage.id, userId: req.user.id });
  }
  //console.log(dbPage.dataValues);
  return { ...fbPage, ...dbPage.dataValues };
};
const images = require("./images");
router.use("/:pageId/images", getPage, images);

const albums = require("./albums");
router.use("/:pageId/albums", getPage, albums);

router.get("/test", async (req, res, next) => {
  res
    .status(200)
    .send((await models.attributeType.findAll()).map(item => item.value));
});

router.get("/", async (req, res, next) => {
  const token = req.user.facebook_access_token;
  const id = req.user.facebook_id;
  let pages = await fb.getPages(id, token);

  pages = pages.map(async page => {
    const local = await assignPage(req, page);
    return local;
  });

  res.status(200).send(await Promise.all(pages));
  //this point for geting all pages from auth user
});

router.get("/connectedPages", async (req, res, next) => {
  const conectedPages = (await models.page.findAll({
    where: { isConnected: true }
  })).map(page => page.id);
  const token = req.user.facebook_access_token;
  const id = req.user.facebook_id;
  console.log(conectedPages);
  const fbPages = (await fb.getPages(id, token))
    .filter(page => conectedPages.includes(page.id))
    .map(async page => {
      const local = await assignPage(req, page);
      return local;
    });
  res.status(200).send(await Promise.all(fbPages));
});
router.get("/:pageId/attributes", getPage, async (req, res, next) => {
  res.redirect(`/api/v1/attributes/${req.page.id}`);
});

router.get("/:pageId/tags", getPage, async (req, res, next) => {
  const mediators = await models.mediator.findAll({
    where: { pageId: req.page.id }
  });
  // mediators.forEach(item => console.log(item.dataValues));

  const tags = mediators.map(async mediator => {
    console.log(mediator.dataValues);
    const tag = await models.tag.findByPk(mediator.tagId);
    const type = await models.tagType.findByPk(tag.type);
    tag.type = type.value;
    //console.log(tag);
    return tag;
  });
  res.status(200).send(await Promise.all(tags));
});

router.post("/:pageId/tags/link", getPage, async (req, res, next) => {
  //input data tag id
  const tagId = req.body.tagId;
  const obj = {
    pageId: req.page.id,
    tagId: tagId
  };
  const mediator = await models.mediator
    .findOrCreate({ where: obj })
    .catch(err => next(err));
  console.log(mediator);
  if (mediator[1]) {
    const tag = await models.tag.findByPk(tagId).catch(next);
    const pages = tag.pages + 1;
    await tag.update({ pages: pages }).catch(next);
  }
  res.redirect(`/api/v1/pages/${req.page.id}/tags`);
});

router.post("/:pageId/tags/unlink", getPage, async (req, res, next) => {
  const tagId = req.body.tagId;
  const obj = {
    pageId: req.page.id,
    tagId: tagId
  };
  const mediators = await models.mediator
    .findAll({ where: obj })
    .catch(err => next(err));
  if (mediators) {
    mediators.forEach(async mediator => {
      await mediator.destroy().catch(err => next(err));
      const tag = await models.tag.findByPk(tagId).catch(next);
      const pages = tag.pages - 1;
      await tag.update({ pages: pages }).catch(next);
    });
    res.redirect(`/api/v1/pages/${req.page.id}/tags`);
  }
});

router.get("/:pageId/tags/:id", async (req, res, next) => {
  res.redirect(`/api/v1/tags/${req.params.id}`);
});

router.patch("/:pageId/tags/:id/update", async (req, res, next) => {
  res.redirect(307, `/api/v1/tags/${req.params.id}/update`);
});

router.get("/:pageId", getPage, async (req, res, next) => {
  res.status(200).send(req.page);
});
router.patch("/:pageId/update", getPage, async (req, res, next) => {
  const id = req.page.id;
  const obj = {
    isConnected: req.body.isConnected
  };
  const dbPage = await models.page.findByPk(id).catch(err => next(err));
  const updated = await dbPage.update(obj).catch(err => next(err));
  const page = await assignPage(req, req.page);
  res.status(200).send(page);
});

module.exports = router;
