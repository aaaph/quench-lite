const express = require("express");
const router = express.Router();

const auth = require("./auth");
const users = require("./users");
const pages = require("./pages");

router.use("/auth", auth);
router.use("/users", users);
router.use("/pages", pages);

router.use("/", (req, res, next) => {
  console.log(req.headers);
  res.status(404).send("unused url");
});
module.exports = router;
