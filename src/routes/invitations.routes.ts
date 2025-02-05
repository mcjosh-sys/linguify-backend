import {
  createInvitation,
  getInvitations,
  revokeInvitation,
} from "@/controllers/invitations.controllers";
import {
  validateParams,
  validateQuery,
  validateRequestBody,
} from "@/middleware/validation";
import {
  invitationQuerySchema,
  invitationSchema,
} from "@/schemas/invitation.schema";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .get(validateQuery(invitationQuerySchema), getInvitations)
  .post(validateRequestBody(invitationSchema), createInvitation);
router.delete("/:id", validateParams({ id: "string" }), revokeInvitation);

export default router;
