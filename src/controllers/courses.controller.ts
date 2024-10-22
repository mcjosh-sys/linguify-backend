import logger from "@/lib/uitls/logger";
import type { NextFunction, Request, Response } from "express";
import {
  checkIfPermitted,
  fetchCourseById,
  fetchCourses,
  mutateCourse,
} from "../db/queries";

// COURSE
export const getCourses = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courses = await fetchCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
  next();
};

export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const courseId = parseInt(req.params.courseId);
  if (!courseId) {
    res.status(404).json("Not Found");
    return next();
  }
  try {
    const data = await fetchCourseById(courseId);

    if (!data) {
      res.status(404).json("Not Found");
      return next();
    }
    res.status(200).json(data);
  } catch (error) {
    logger.error(error);
    res.status(500).json("Internal Server Error");
  }

  next();
};

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const title = req.body.title;
  const imageSrc = req.body.imageSrc;

  if (!userId) {
    res.status(400).json("userId is required");
    return next();
  }

  if (!title || !imageSrc) {
    res.status(400).json("title or imageSrc is missing");
    return next();
  }

  try {
    const hasPermission = await checkIfPermitted(userId);
    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateCourse("create", { title, imageSrc });
    res.status(201).json("Course created successfully.");
  } catch (error) {
    logger.error(error);
    res.status(500).json("Internal Server Error");
  }

  next();
};
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const courseId = parseInt(req.params.courseId);
  const title = req.body.title;
  const imageSrc = req.body.imageSrc;

  if (!userId || !courseId) {
    res.status(400).json("Missing userId or courseId");
    return next();
  }

  try {
    const course = await fetchCourseById(courseId);

    if (!course) {
      res.status(404).json(`Course with the id '${courseId}' does not exist.`);
      return next();
    }

    const hasPermission = await checkIfPermitted(userId, courseId);
    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateCourse("update", { course: { title, imageSrc }, courseId });
    res.json("Course updated successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const courseId = parseInt(req.params.courseId);

  if (!userId || !courseId) {
    res.status(400).json("Missing userId or courseId");
    return next();
  }

  try {

    const hasPermission = await checkIfPermitted(userId, courseId);
    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateCourse("delete", courseId);
    res.json("Course deleted successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }
  next()
};
