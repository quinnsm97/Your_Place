const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const { createSpaceSchema, updateSpaceSchema, idParamSchema } = require("../services/spaces.service");
const controller = require("../controllers/spaces.controller");

const router = express.Router();

router.get("/", controller.listSpaces);
router.get("/:id", validate(idParamSchema, "params"), controller.getSpaceById);

router.post(
  "/",
  requireAuth,
  requireRole("host"),
  validate(createSpaceSchema),
  controller.createSpace
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("host"),
  validate(idParamSchema, "params"),
  validate(updateSpaceSchema),
  controller.updateSpace
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("host"),
  validate(idParamSchema, "params"),
  controller.deleteSpace
);

module.exports = router;
