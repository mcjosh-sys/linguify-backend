import { Router } from 'express'
import { getMedia, postMedia } from '@/controllers/media.controller'
import { validateRequestBody } from '@/middleware/validation'
import { mediaSchema } from '@/schemas/media.schema'

const router = Router()

router.route('/').get(getMedia).post(validateRequestBody(mediaSchema),postMedia)

export default router