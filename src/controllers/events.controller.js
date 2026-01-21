const service = require("../services/events.service");

async function listEvents(req, res, next) {
  try {
    const events = await service.listEvents(req.query);
    res.json({ data: events });
  } catch (e) {
    next(e);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await service.getEventById(Number(req.params.id));
    res.json({ data: event });
  } catch (e) {
    next(e);
  }
}

async function createEvent(req, res, next) {
  try {
    const created = await service.createEvent(req.user.id, req.body);
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
}

async function updateEvent(req, res, next) {
  try {
    const updated = await service.updateEvent(req.user.id, Number(req.params.id), req.body);
    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
}

async function deleteEvent(req, res, next) {
  try {
    await service.deleteEvent(req.user.id, Number(req.params.id));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };
