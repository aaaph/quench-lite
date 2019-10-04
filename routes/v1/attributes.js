const express = require("express");
const router = express.Router();

const models = require("../../models");
const fb = require("../../lib/facebookAPI");

router.get("/", async (req, res, next) => {
  const attrs = await models.attribute.findAll();
  res.status(200).send(attrs);
});

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
const getAttr = async (req, res, next) => {
  const id = req.params.attrId;
  const attr = await models.attribute.findByPk(id).catch(err => {
    next({ ...err, ...{ status: 400 } });
    return;
  });
  if (!attr) {
    next({ message: "not found", status: 404 });
    return;
  }
  req.attr = attr;
  next();
};

router.post("/:pageId/create", getPage, async (req, res, next) => {
  const type = await models.attributeType.findOne({
    where: { value: req.body.type }
  });
  if (!type) {
    next({ message: "type doesnt exist", status: 400 });
  }

  const obj = {
    pageId: req.page.id,
    type: type.dataValues.id,
    name: req.body.name,
    description: req.body.description,
    url: req.body.url
  };
  const attr = await models.attribute.create(obj);
  const answer = attr.dataValues;
  answer.type = (await models.attributeType.findByPk(answer.type)).value;
  res.status(201).send(answer);
});

router.get("/:pageId", getPage, async (req, res, next) => {
  const attrs = await models.attribute.findAll({
    where: { pageId: req.page.id }
  });
  res.status(200).send(attrs);
});
router.get("/:pageId/:attrId", getPage, getAttr, async (req, res, next) => {
  res.status(200).send(req.attr);
});
router.patch(
  "/:pageId/:attrId/update",
  getPage,
  getAttr,
  async (req, res, next) => {
    const type = await models.attributeType.findOne({
      where: { value: req.body.type }
    });
    if (!type) {
      next({ message: "type dont exist", status: 400 });
    }
    const obj = {
      name: req.body.name,
      description: req.body.description,
      url: req.body.url,
      type: type.dataValues.id
    };
    const updated = await req.attr.update(obj);
    const answer = updated.dataValues;
    answer.type = (await models.attributeType.findByPk(answer.type)).value;
    res.status(200).send(answer);
  }
);
router.delete(
  "/:pageId/:attrId/delete",
  getPage,
  getAttr,
  async (req, res, next) => {
    await req.attr.destroy().catch(err => next(err));
    res.status(204).send("success");
  }
);
module.exports = router;
