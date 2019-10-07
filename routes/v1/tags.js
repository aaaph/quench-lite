const express = require("express");
const router = express.Router();

const models = require("../../models");

const getTag = async (req, res, next) => {
  const tag = await models.tag.findByPk(req.params.id).catch(err => next(err));
  if (!tag) {
    next({ message: "tag is null", status: 400 });
    return;
  } else {
    req.tag = tag;
    next();
  }
};

router.get("/types", async (req, res, next) => {
  const types = (await models.tagType.findAll()).map(
    type => type.dataValues.value
  );
  res.status(200).send(types);
});

router.get("/", async (req, res, next) => {
  const tags = (await models.tag.findAll().catch(err => next(err))).map(
    async tag => {
      const type = await models.tagType.findByPk(tag.type);
      tag.type = type.value;
      return tag;
    }
  );
  res.status(200).send(await Promise.all(tags));
});

router.get("/types/:type", async (req, res, next) => {
  const type = await models.tagType.findOne({
    where: { value: req.params.type }
  });
  if (!type) {
    await next({ message: "type does not exist", status: 400 });
    return;
  }
  const tags = await models.tag.findAll().catch(err => next(err));
  const filt = tags.filter(tag => tag.type == type.id);
  res.status(200).send(filt);
});

router.post("/create", async (req, res, next) => {
  const type = await models.tagType.findOne({
    where: { value: req.body.type }
  });
  if (!type) {
    next({ message: "type does not exist!!", status: 400 });
  }
  const obj = {
    name: req.body.name,
    type: type.id,
    description: req.body.description,
    isSupervisor: req.body.isSupervisor
  };
  {
    const tag = await models.tag
      .findOne({ where: { name: obj.name } })
      .catch(next);
    if (tag) {
      res.status(407).send("tag already exist");
      return;
    }
  }
  const tag = await models.tag.create(obj).catch(err => next(err));
  if (tag) {
    if (req.body.pageId) {
      const mediator = {
        tagId: tag.id,
        pageId: req.body.pageId
      };
      await models.mediator.create(mediator).catch(console.log);
      const pages = tag.pages + 1;
      const updated = await tag.update({ pages: pages }).catch(next);
    }
    res.redirect(`/api/v1/tags/${tag.id}`);
  }
});

router.get("/:id", getTag, async (req, res, next) => {
  const type = await models.tagType.findByPk(req.tag.type);
  req.tag.type = type.value;
  res.status(200).send(req.tag);
});

router.delete("/:id/delete", getTag, async (req, res, next) => {
  const mediators = await models.mediator
    .findAll({ where: { tagId: req.tag.id } })
    .catch(err => next(err));
  console.log(mediators);
  if (mediators) {
    mediators.forEach(async mediator => await mediator.destroy().catch(next));
  }
  const tag = await models.tag.findByPk(req.params.id);
  console.log(tag);
  await tag.destroy().catch(next);
  console.log(tag.dataValues);
  res.status(204).send("exist");
});

router.get("/:id/pages", getTag, async (req, res, next) => {
  const mediators = await models.mediator.findAll({
    where: { tagId: req.tag.id }
  });
  const pages = mediators.map(async mediator => {
    const page = await models.page.findByPk(mediator.pageId);
    return page;
  });
  res.status(200).send(await Promise.all(pages));
});

router.post("/:id/link", getTag, async (req, res, next) => {
  const obj = {
    tagId: req.tag.id,
    pageId: req.body.pageId
  };
  const mediator = await models.mediator
    .findOrCreate({ where: obj })
    .catch(err => next(err));
  console.log(mediator[1]);
  if (mediator) {
    if (mediator[1]) {
      const tag = await models.tag.findByPk(req.tag.id).catch(next);
      const pages = tag.pages + 1;
      await tag.update({ pages: pages }).catch(next);
    }
    res.redirect(`/api/v1/tags/${req.tag.id}/pages`);
  }
});

router.post("/:id/unlink", getTag, async (req, res, next) => {
  const obj = {
    tagId: req.tag.id,
    pageId: req.body.pageId
  };
  const mediators = await models.mediator
    .findAll({ where: obj })
    .catch(err => next(err));
  if (mediators) {
    mediators.forEach(async mediator => {
      await mediator.destroy().catch(err => next(err));
      const tag = await models.tag.findByPk(req.tag.id).catch(next);
      const pages = tag.pages - 1;
      await tag.update({ pages: pages }).catch(next);
    });
    res.redirect(`/api/v1/tags/${req.tag.id}/pages`);
  }
});

router.patch("/:id/update", async (req, res, next) => {
  const tag = await models.tag.findByPk(req.params.id).catch(err => next(err));
  if (!tag) {
    next(err);
  }
  const obj = {
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    isSupervisor: req.body.isSupervisor
  };
  if (obj.type) {
    const type = await models.tagType.findOne({
      where: { value: req.body.type }
    });
    if (!type) {
      next({ message: "type does not exist!!", status: 400 });
      return;
    }
    obj.type = type.id;
  }
  const updated = await tag.update(obj).catch(err => next(err));
  const type = await models.tagType.findByPk(updated.type);
  updated.type = type.value;
  res.status(200).send(updated);
});

module.exports = router;
