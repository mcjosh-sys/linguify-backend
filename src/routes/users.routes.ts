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
import { validateParams, validateRequestBody } from "@/middleware/validation";
import { getLessonParamsSchema, userProgressSchema } from "@/schemas/user.schema";

const router = Router();

router
  .route("/:userId/progress")
  .get(validateParams({ userId: "string" }), getUserProgress)
  .post(
    validateParams({ userId: "string" }),
    validateRequestBody(userProgressSchema),
    insertUserProgress
  )
  .patch(
    validateParams({ userId: "string" }),
    validateRequestBody(userProgressSchema),
    updateUserProgress
  );
router.get(
  "/:userId/subscription/",
  validateParams({ userId: "string" }),
  getUserSubscription
);
router.patch(
  "/:userId/progress/hearts/reduce",
  validateParams({ userId: "string" }),
  reduceHeart
);
router.patch(
  "/:userId/progress/hearts/refill",
  validateParams({ userId: "string" }),
  refillHeart
);
router.get(
  "/:userId/learn/units/",
  validateParams({ userId: "string" }),
  getUnits
);
router.get(
  "/:userId/learn/course/progress/",
  validateParams({ userId: "string" }),
  getCourseProgress
);
router.get(
  "/:userId/learn/lesson/",
  validateParams(getLessonParamsSchema),
  getLesson
);
router.get(
  "/:userId/learn/lesson/:lessonId/",
  validateParams({ userId: "string", lessonId: "number" }),
  getLesson
);
router.get(
  "/:userId/learn/lesson/progress/percentage/",
  validateParams({ userId: "string" }),
  getLessonPercentage
);
router.get("/top-ten-users", getTopTenUsers);


export default router;
