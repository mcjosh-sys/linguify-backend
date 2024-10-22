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
router.get("/:courseId", getCourseById);
router.post("/:userId", createCourse);

router.route("/:userId/:courseId").patch(updateCourse).delete(deleteCourse);

export default router;
