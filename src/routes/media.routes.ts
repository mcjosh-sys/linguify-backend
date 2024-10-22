import { Router } from 'express'
import { getMedia, postMedia } from '@/controllers/media.controller'

const router = Router()

router.route('/').get(getMedia).post(postMedia)

export default router