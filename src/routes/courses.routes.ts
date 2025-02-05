import { checkPermission } from "@/middleware/permission";
import { validateParams, validateRequestBody } from "@/middleware/validation";
import { courseSchema } from "@/schemas/course.schema";
import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from "../controllers/courses.controller";

const router = Router();

router.get("/", getCourses);
router.get("/:courseId", validateParams({ courseId: "number" }), getCourseById);
router.post(
  "/:userId",
  validateParams({ userId: "string" }),
  checkPermission,
  validateRequestBody(courseSchema),
  createCourse
);

router
  .route("/:userId/:courseId")
  .patch(
    validateParams({ courseId: "number", userId: "string" }),
    checkPermission,
    validateRequestBody(courseSchema.partial()),
    updateCourse
  )
  .delete(
    validateParams({ courseId: "number", userId: "string" }),
    checkPermission,
    deleteCourse
  );

export default router;
