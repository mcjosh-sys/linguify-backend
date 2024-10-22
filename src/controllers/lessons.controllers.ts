import {
  checkIfPermitted,
  fetchLessonById,
  fetchLessons,
  fetchUnitById,
  mutateLesson,
} from "@/db/queries";
import type { lessons, units } from "@/db/schema";
import type { NextFunction, Request, Response } from "express";

const lessonResolver = (reqBody: any): typeof lessons.$inferInsert => {
  const { title, order } = reqBody;
  const unitId = parseInt(reqBody.unitId);

  return {
    title,
    order,
    unitId,
  };
};

// LESSON
export const getLessons = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchLessons();
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lessonId = parseInt(req.params.lessonId);

  if (!lessonId) {
    res.status(404).json("Not Found");
    return next();
  }

  try {
    const data = await fetchLessonById(lessonId);
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json("Missing userId.");
    return next();
  }

  const lessonData = lessonResolver(req.body);

  if (Object.entries(lessonData).some(([_, value]) => !value)) {
    res.status(400).json("Missing information in the request body.");
    return next();
  }

  try {
    const unit = await fetchUnitById(lessonData.unitId);
    if (!unit) {
      res.status(400).json(`No unit with the id '${lessonData.unitId}' found.`);
      return next();
    }

    const hasPermission = await checkIfPermitted(userId, unit.courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateLesson("create", { lesson: lessonData });
    res.status(201).json("Lesson has been created successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const lessonId = parseInt(req.params.lessonId);

  if (!userId || !lessonId) {
    res.status(400).json("Missing userId or lessonId.");
    return next();
  }

  let lessonData = lessonResolver(req.body);

  try {
    let unit: typeof units.$inferInsert | undefined;
    
    if (lessonData.unitId) unit = await fetchUnitById(lessonData.unitId);
    const lesson = await fetchLessonById(lessonId);

    if (lessonData.unitId && !unit) {
      res.status(400).json("Invalid unit.");
      return next();
    }

    const hasPermission = await checkIfPermitted(userId, lesson.courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateLesson("update", { lesson: lessonData, lessonId });
    res.json("Lesson has been updated successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const lessonId = parseInt(req.params.lessonId);

  if (!userId || !lessonId) {
    res.status(400).json("Missing userId or lessonId.");
    return next();
  }

  try {
    const lesson = await fetchLessonById(lessonId);

    const hasPermission = await checkIfPermitted(userId, lesson.courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateLesson("delete", { lessonId });
    res.json("Lesson has been deleted successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
