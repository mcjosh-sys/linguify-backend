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

router.get("/:challengeId/users/:userId/progress", getChallengeProgress);
router
  .route("/:challengeId/progress")
  .post(insertChallengeProgress)
  .patch(updateChallengeProgress);

router.get("/", getChallenges);

router.get("/:challengeId", getChallengeById);

router.post("/:userId", createChallenge)

router
  .route("/:userId/:challengeId")
  .patch(updateChallenge).delete(deleteChallenge);


export default router;
