import { createChallengeOption, deleteChallengeOption, getChallengeOptionById, getChallengeOptions, updateChallengeOption } from "@/controllers/challenge-options.controllers";
import { Router } from "express";

const router = Router()

router.get("/", getChallengeOptions);
router.get("/:challengeOptionId", getChallengeOptionById);
router.post("/:userId", createChallengeOption)
router
  .route("/:userId/:challengeOptionId")
  .patch(updateChallengeOption).delete(deleteChallengeOption)

export default router