import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import validate from "../middleware/validate.js";
import { createSpaceSchema, updateSpaceSchema, idParamSchema } from "../services/spaces.service.js";
import * as controller from "../controllers/spaces.controller.js";

const router = Router();

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

export default router;
