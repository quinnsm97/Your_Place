const { z } = require('zod')
const ApiError = require('../utils/ApiError')
const model = require('../models/spaces.model')

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const createSpaceSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(''),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
  capacity: z.coerce.number().int().min(0),
})

const updateSpaceSchema = createSpaceSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be provided' })

async function listSpaces() {
  return model.listSpaces()
}

async function getSpaceById(spaceId) {
  const space = await model.getSpaceById(spaceId)
  if (!space) throw new ApiError(404, 'NOT_FOUND', 'Space not found')
  return space
}

async function createSpace(hostUserId, payload) {
  return model.createSpace(hostUserId, payload)
}

async function updateSpace(hostUserId, spaceId, payload) {
  const space = await model.getSpaceById(spaceId)
  if (!space) throw new ApiError(404, 'NOT_FOUND', 'Space not found')
  if (space.host_user_id !== hostUserId) throw new ApiError(403, 'FORBIDDEN', 'Not your space')

  return model.updateSpace(spaceId, payload)
}

async function deleteSpace(hostUserId, spaceId) {
  const space = await model.getSpaceById(spaceId)
  if (!space) throw new ApiError(404, 'NOT_FOUND', 'Space not found')
  if (space.host_user_id !== hostUserId) throw new ApiError(403, 'FORBIDDEN', 'Not your space')

  await model.deleteSpace(spaceId)
}

module.exports = {
  idParamSchema,
  createSpaceSchema,
  updateSpaceSchema,
  listSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
}
