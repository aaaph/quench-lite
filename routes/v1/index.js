const express = require("express");
const router = express.Router();

const auth = require("./auth");
const users = require("./users");
const current = require("./current");

router.use("/auth", auth);
router.use("/users", users);
router.use("/current", current);

router.use("/", (req, res, next) => {
  res.status(404).send("unused url");
});
module.exports = router;
