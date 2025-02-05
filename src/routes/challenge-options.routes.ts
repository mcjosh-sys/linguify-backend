import { createChallengeOption, deleteChallengeOption, getChallengeOptionById, getChallengeOptions, updateChallengeOption } from "@/controllers/challenge-options.controllers";
import { checkPermission } from "@/middleware/permission";
import { validateParams, validateRequestBody } from "@/middleware/validation";
import { challengeOptionSchema } from "@/schemas/challenge-option.schema";
import { Router } from "express";

const router = Router()

router.get("/", getChallengeOptions);
router.get(
  "/:challengeOptionId",
  validateParams({ challengeOptionId : "number" }),
  getChallengeOptionById
);
router.post(
  "/:userId",
  validateParams({ userId: "string" }),
  checkPermission,
  validateRequestBody(challengeOptionSchema),
  createChallengeOption
);
router
  .route("/:userId/:challengeOptionId")
  .patch(
    validateParams({ userId: "string", challengeOptionId: "number" }),
    checkPermission,
    validateRequestBody(challengeOptionSchema.partial()),
    updateChallengeOption
  )
  .delete(
    validateParams({ userId: "string", challengeOptionId: "number" }),
    checkPermission,
    deleteChallengeOption
  );

export default router