import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import validate from "../middleware/validate.js";
import { createEventSchema, updateEventSchema, idParamSchema, listQuerySchema } from "../services/events.service.js";
import * as controller from "../controllers/events.controller.js";

const router = Router();

router.get("/", validate(listQuerySchema, "query"), controller.listEvents);
router.get("/:id", validate(idParamSchema, "params"), controller.getEventById);

router.post(
  "/",
  requireAuth,
  requireRole("host"),
  validate(createEventSchema),
  controller.createEvent
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("host"),
  validate(idParamSchema, "params"),
  validate(updateEventSchema),
  controller.updateEvent
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("host"),
  validate(idParamSchema, "params"),
  controller.deleteEvent
);

export default router;
