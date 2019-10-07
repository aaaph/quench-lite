const express = require("express");
const router = express.Router();

const models = require("../../../models");

router.get("/", async (req, res, next) => {
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

router.post("/link", async (req, res, next) => {
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

router.post("/unlink", async (req, res, next) => {
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

router.get("/:id", async (req, res, next) => {
  res.redirect(`/api/v1/tags/${req.params.id}`);
});

router.patch("/:id/update", async (req, res, next) => {
  res.redirect(307, `/api/v1/tags/${req.params.id}/update`);
});
module.exports = router;
