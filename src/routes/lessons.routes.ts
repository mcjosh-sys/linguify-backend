import {
  createLesson,
  deleteLesson,
  getLessonById,
  getLessons,
  updateLesson,
} from "@/controllers/lessons.controllers";
import { checkPermission } from "@/middleware/permission";
import { validateParams, validateRequestBody } from "@/middleware/validation";
import { lessonSchema } from "@/schemas/lesson.schema";
import { Router } from "express";

const router = Router();

router.get("/", getLessons);
router.get("/:lessonId", validateParams({ lessonId: "number" }), getLessonById);
router.post(
  "/:userId",
  validateParams({ userId: "string" }),
  checkPermission,
  validateRequestBody(lessonSchema),
  createLesson
);
router
  .route("/:userId/:lessonId")
  .patch(
    validateParams({ lessonId: "number", userId: "string" }),
    checkPermission,
    validateRequestBody(lessonSchema.partial()),
    updateLesson
  )
  .delete(
    validateParams({ lessonId: "number", userId: "string" }),
    checkPermission,
    deleteLesson
  );

export default router;
