import { Router } from "express";
import {
  getCourseProgress,
  getLesson,
  getLessonPercentage,
  getTopTenUsers,
  getUnits,
  getUserProgress,
  getUserSubscription,
  insertUserProgress,
  reduceHeart,
  refillHeart,
  updateUserProgress,
} from "../controllers/users.controller";

const router = Router();

router
  .route("/:userId/progress")
  .get(getUserProgress)
  .post(insertUserProgress)
  .patch(updateUserProgress);
router.get("/:userId/subscription/", getUserSubscription);
router.patch("/:userId/progress/hearts/reduce", reduceHeart);
router.patch("/:userId/progress/hearts/refill", refillHeart);
router.get("/:userId/learn/units/", getUnits);
router.get("/:userId/learn/course/progress/", getCourseProgress);
router.get("/:userId/learn/lesson/", getLesson);
router.get("/:userId/learn/lesson/:lessonId/", getLesson);
router.get("/:userId/learn/lesson/progress/percentage/", getLessonPercentage);
router.get("/top-ten-users", getTopTenUsers);


export default router;
