import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import db from "../db/drizzle";
import {
  fetchCourseProgress,
  fetchLesson,
  fetchTopTenUsers,
  fetchUnits,
  fetchUserProgress,
  fetchUserSubscription,
  mutateHeartQuery,
  POINTS_TO_REFILL,
} from "../db/queries";
import { courses, invitations, userProgress } from "../db/schema";
import logger from "../lib/uitls/logger";

export const getUserProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const userProgress = await fetchUserProgress(userId);
    res.status(200).json(userProgress);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const updateUserProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const time = new Date().getTime()
  const { userId } = req.params;
  const {
    activeCourseId,
  }: {
    activeCourseId: number;
  } = req.body;

  try {
    const course = await db.query.courses.findFirst({
      with: {
        units: {
          with: {
            lessons: true,
          },
        },
      },
      where: eq(courses.id, activeCourseId),
    });
    if (!course) {
      res.status(404).send("course not found");
      return next();
    }
    if (!course.units.length || !course.units[0].lessons.length) {
      res.status(403).send("Course is empty");
      return next();
    }
    const data = await db
      .update(userProgress)
      .set({
        activeCourseId,
      })
      .where(eq(userProgress.userId, userId));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const insertUserProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const {
    activeCourseId,
  }: {
    activeCourseId: number;
  } = req.body;

  try {
    const course = await db.query.courses.findFirst({
      with: {
        units: {
          with: {
            lessons: true,
          },
        },
      },
      where: eq(courses.id, activeCourseId),
    });
    if (!course) {
      res.status(404).send("course not found");
      return next();
    }
    if (!course.units.length || !course.units[0].lessons.length) {
      res.status(403).send("Course is empty");
      return next();
    }

    await db.insert(userProgress).values({
      userId,
      activeCourseId,
    });
    res.status(201).json();
  } catch (error) {
    logger.error(error);
    res.status(500).json("Internal Server Error");
  }

  next();
};

export const getUnits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const units = await fetchUnits(userId);
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const getCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const firstUncompletedLesson = await fetchCourseProgress(userId);
    res.status(200).json(firstUncompletedLesson);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const getLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const lessonId = parseInt(req.params.lessonId);

  try {
    const lesson = await fetchLesson(userId, lessonId || undefined);
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const getLessonPercentage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const courseProgress = await fetchCourseProgress(userId);

    if (!courseProgress?.activeLessonId) {
      res.status(200).json(0);
      return next();
    }
    const lesson = await fetchLesson(userId, courseProgress?.activeLessonId);

    if (!lesson) {
      res.status(200).json(0);
      return next();
    }

    const completedChallenges = lesson?.challenges.filter(
      (challenge) => challenge.completed
    );
    const percentage = Math.round(
      (completedChallenges?.length! / lesson?.challenges.length!) * 100
    );

    res.status(200).json(percentage);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const reduceHeart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  if (!userId) {
    res.sendStatus(401);
    return next();
  }

  try {
    const currentUserProgress = await fetchUserProgress(userId);
    const userSubscription = await fetchUserSubscription(userId);

    if (!currentUserProgress) {
      res.status(404).json("User progress not found.");
      return next();
    }

    if (userSubscription?.isActive) {
      res.json({ error: "subscription" });
      return next();
    }

    if (!currentUserProgress.hearts) {
      res.json({ error: "hearts" });
      return next();
    }

    await mutateHeartQuery(currentUserProgress, "reduce");
    res.status(200).json("hearts reduced successfully");
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const refillHeart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  if (!userId) {
    res.status(404).json("Not Found");
    return next();
  }

  try {
    const currentUserProgress = await fetchUserProgress(userId);

    if (!currentUserProgress) {
      res.status(404).json("User progress not found.");
      return next();
    }

    if (currentUserProgress.points < POINTS_TO_REFILL) {
      res.status(403).json("Not enough points");
      return next();
    }

    await mutateHeartQuery(currentUserProgress, "refill");
    res.status(200).json("hearts reduced successfully");
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const getUserSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(404).json("missing user id");
    return next();
  }

  try {
    const userSubscription = await fetchUserSubscription(userId);
    res.status(200).json(userSubscription);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const getTopTenUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchTopTenUsers();
    res.json(data);
  } catch (error) {
    logger.error(error, "[getTopTenUsers error]");
    res.status(500).json("Internal Server Error");
  }
  next();
};
