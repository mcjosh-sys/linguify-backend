import { checkPermission } from "@/middleware/permission";
import { validateParams, validateRequestBody } from "@/middleware/validation";
import {
  challengeProgressSchema,
  challengeSchema,
} from "@/schemas/challenge.schema";
import { Router } from "express";
import {
  createChallenge,
  deleteChallenge,
  getChallengeById,
  getChallengeProgress,
  getChallenges,
  insertChallengeProgress,
  updateChallenge,
  updateChallengeProgress,
} from "../controllers/challenges.controller";

const router = Router();

router.get(
  "/:challengeId/users/:userId/progress",
  validateParams({ challengeId: "number", userId: "string" }),
  getChallengeProgress
);
router
  .route("/:challengeId/progress")
  .post(
    validateParams({ challengeId: "number" }),
    validateRequestBody(challengeProgressSchema),
    insertChallengeProgress
  )
  .patch(
    validateParams({ challengeId: "number" }),
    validateRequestBody(challengeProgressSchema),
    updateChallengeProgress
  );

router.get("/", getChallenges);

router.get(
  "/:challengeId",
  validateParams({ challengeId: "number" }),
  getChallengeById
);

router.post(
  "/:userId",
  validateParams({ userId: "string" }),
  checkPermission,
  validateRequestBody(challengeSchema),
  createChallenge
);

router
  .route("/:userId/:challengeId")
  .patch(
    validateParams({ challengeId: "number", userId: "string" }),
    checkPermission,
    validateRequestBody(challengeSchema.partial()),
    updateChallenge
  )
  .delete(
    validateParams({ challengeId: "number", userId: "string" }),
    checkPermission,
    deleteChallenge
  );

export default router;
