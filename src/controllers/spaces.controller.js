import * as service from "../services/spaces.service.js";

async function listSpaces(req, res, next) {
  try {
    const spaces = await service.listSpaces();
    res.json({ data: spaces });
  } catch (e) {
    next(e);
  }
}

async function getSpaceById(req, res, next) {
  try {
    const space = await service.getSpaceById(Number(req.params.id));
    res.json({ data: space });
  } catch (e) {
    next(e);
  }
}

async function createSpace(req, res, next) {
  try {
    const created = await service.createSpace(req.user.id, req.body);
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
}

async function updateSpace(req, res, next) {
  try {
    const updated = await service.updateSpace(req.user.id, Number(req.params.id), req.body);
    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
}

async function deleteSpace(req, res, next) {
  try {
    await service.deleteSpace(req.user.id, Number(req.params.id));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export { listSpaces, getSpaceById, createSpace, updateSpace, deleteSpace };
