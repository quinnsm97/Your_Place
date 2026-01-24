const { z } = require('zod')
const ApiError = require('../utils/ApiError')
const model = require('../models/events.model')
const spacesModel = require('../models/spaces.model')

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const listQuerySchema = z
  .object({
    city: z.string().min(1).max(120).optional(),
    category: z.string().min(1).max(120).optional(),
    status: z.string().min(1).max(60).optional(),
  })
  .passthrough()

const baseEventSchema = z.object({
  space_id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional().default(''),
  category: z.string().min(1).max(120),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  capacity: z.coerce.number().int().min(0),
  price_per_spot: z.coerce.number().min(0),
  status: z.string().min(1).max(60).optional().default('draft'),
})

const createEventSchema = baseEventSchema.refine((v) => new Date(v.end_at) > new Date(v.start_at), {
  message: 'end_at must be after start_at',
  path: ['end_at'],
})

const updateEventSchema = baseEventSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be provided' })
  .superRefine((v, ctx) => {
    // If both provided in patch, validate ordering
    if (v.start_at && v.end_at) {
      if (new Date(v.end_at) <= new Date(v.start_at)) {
        ctx.addIssue({ code: 'custom', message: 'end_at must be after start_at', path: ['end_at'] })
      }
    }
  })

async function listEvents(filters) {
  return model.listEvents(filters)
}

async function getEventById(eventId) {
  const event = await model.getEventById(eventId)
  if (!event) throw new ApiError(404, 'NOT_FOUND', 'Event not found')
  return event
}

async function createEvent(hostUserId, payload) {
  // Ensure host owns the space they are using
  const space = await spacesModel.getSpaceById(payload.space_id)
  if (!space) throw new ApiError(404, 'NOT_FOUND', 'Space not found')
  if (space.host_user_id !== hostUserId) {
    throw new ApiError(403, 'FORBIDDEN', 'You can only create events in your own spaces')
  }
  return model.createEvent(hostUserId, payload)
}

async function updateEvent(hostUserId, eventId, payload) {
  const event = await model.getEventById(eventId)
  if (!event) throw new ApiError(404, 'NOT_FOUND', 'Event not found')
  if (event.host_user_id !== hostUserId) throw new ApiError(403, 'FORBIDDEN', 'Not your event')

  // If patching space_id, ensure the new space is also owned by host
  if (payload.space_id) {
    const space = await spacesModel.getSpaceById(payload.space_id)
    if (!space) throw new ApiError(404, 'NOT_FOUND', 'Space not found')
    if (space.host_user_id !== hostUserId) {
      throw new ApiError(403, 'FORBIDDEN', 'You can only move an event to your own spaces')
    }
  }

  // If patch supplies both times, zod handles. If only one provided,
  // we'll validate against existing in model layer by merging here:
  if (payload.start_at || payload.end_at) {
    const mergedStart = payload.start_at ?? event.start_at
    const mergedEnd = payload.end_at ?? event.end_at
    if (new Date(mergedEnd) <= new Date(mergedStart)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'end_at must be after start_at')
    }
  }

  return model.updateEvent(eventId, payload)
}

async function deleteEvent(hostUserId, eventId) {
  const event = await model.getEventById(eventId)
  if (!event) throw new ApiError(404, 'NOT_FOUND', 'Event not found')
  if (event.host_user_id !== hostUserId) throw new ApiError(403, 'FORBIDDEN', 'Not your event')

  await model.deleteEvent(eventId)
}

module.exports = {
  idParamSchema,
  listQuerySchema,
  createEventSchema,
  updateEventSchema,
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
}
