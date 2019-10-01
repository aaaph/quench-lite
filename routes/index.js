const express = require("express");
const router = express.Router();

const v1 = require("./v1");

router.use("/v1", v1);

router.get("/", async (req, res, next) => {
  res.status(404).send("unused url");
});

module.exports = router;
