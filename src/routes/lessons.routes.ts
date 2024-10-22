import { createLesson, deleteLesson, getLessonById, getLessons, updateLesson } from "@/controllers/lessons.controllers";
import { Router } from "express";


const router = Router();

router.get("/", getLessons);
router.get("/:lessonId", getLessonById);
router.post("/:userId", createLesson);
router.route("/:userId/:lessonId").patch(updateLesson).delete(deleteLesson);

export default router;
