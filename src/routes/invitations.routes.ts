import { createInvitation, getInvitations, revokeInvitation } from '@/controllers/invitations.controllers'
import { Router } from 'express'

const router = Router()

router.route("/").get(getInvitations).post(createInvitation)
router.delete("/:id", revokeInvitation)

export default router