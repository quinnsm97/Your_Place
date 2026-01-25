const { z } = require('zod')

// Only allow updating profile-style fields (not email/role/password here)
const updateMeSchema = z
  .object({
    fullName: z.string().min(1).max(160).optional(),
    locale: z.string().min(2).max(10).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'host', 'admin']),
})

module.exports = {
  updateMeSchema,
  idParamSchema,
  updateUserRoleSchema,
}
