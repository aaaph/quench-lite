const express = require("express");
const router = express.Router();

const auth = require("./auth");

router.use("/auth", auth);

router.get("/", async (req, res, next) => {
  res.send({ status: 228 });
});

module.exports = router;
