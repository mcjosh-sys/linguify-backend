import db from "@/lib/db/drizzle";
import {
  fetchCourseProgress,
  fetchLesson,
  fetchTopTenUsers,
  fetchUnits,
  fetchUserProgress,
  fetchUserSubscription,
  mutateHeartQuery,
  POINTS_TO_REFILL,
} from "@/lib/db/queries";
import { courses, userProgress } from "@/lib/db/schema";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type {
  GetLessonParams,
  UserProgressReqBody,
} from "@/schemas/user.schema";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const getUserProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;
  try {
    const userProgress = await fetchUserProgress(userId);
    sendSuccessResponse(res, HTTP_STATUS.OK, userProgress);
  } catch (error) {
    next(error);
  }
};

export const updateUserProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;
  const { activeCourseId }: UserProgressReqBody = req.body;

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
      throw new NotFoundError("course not found");
    }
    if (!course.units.length || !course.units[0].lessons.length) {
      throw new BadRequestError("Course is empty");
    }
    const data = await db
      .update(userProgress)
      .set({
        activeCourseId,
      })
      .where(eq(userProgress.userId, userId));

    sendSuccessResponse(res, HTTP_STATUS.OK, data, "User progress updated");
  } catch (error) {
    next(error);
  }
};
export const insertUserProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;
  const { activeCourseId }: UserProgressReqBody = req.body;

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
      throw new NotFoundError("course not found");
    }
    if (!course.units.length || !course.units[0].lessons.length) {
      throw new BadRequestError("Course is empty");
    }

    await db.insert(userProgress).values({
      userId,
      activeCourseId,
    });

    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      null,
      "User progress created"
    );
  } catch (error) {
    next(error);
  }
};

export const getUnits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;

  try {
    const units = await fetchUnits(userId);
    sendSuccessResponse(res, HTTP_STATUS.OK, units);
  } catch (error) {
    next(error);
  }
};

export const getCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;
  try {
    const firstUncompletedLesson = await fetchCourseProgress(userId);
    sendSuccessResponse(res, HTTP_STATUS.OK, firstUncompletedLesson);
  } catch (error) {
    next(error);
  }
};

export const getLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, lessonId } = req.validatedParams as GetLessonParams;

  try {
    const lesson = await fetchLesson(userId, lessonId);
    sendSuccessResponse(res, HTTP_STATUS.OK, lesson);
  } catch (error) {
    next(error);
  }
};

export const getLessonPercentage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;
  try {
    const courseProgress = await fetchCourseProgress(userId);

    if (!courseProgress?.activeLessonId) {
      return sendSuccessResponse(res, HTTP_STATUS.OK, 0);
    }
    const lesson = await fetchLesson(userId, courseProgress?.activeLessonId);

    if (!lesson) {
      return sendSuccessResponse(res, HTTP_STATUS.OK, 0);
    }

    const completedChallenges = lesson?.challenges.filter(
      (challenge) => challenge.completed
    );
    const percentage = Math.round(
      (completedChallenges?.length / lesson?.challenges.length) * 100
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, percentage);
  } catch (error) {
    next(error);
  }
};

export const reduceHeart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;

  try {
    const [currentUserProgress, userSubscription] = await Promise.all([
      fetchUserProgress(userId),
      fetchUserSubscription(userId),
    ]);

    if (!currentUserProgress) {
      throw new NotFoundError("User progress not found.");
    }

    if (userSubscription?.isActive) {
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        { error: "subscription" },
        "Subscription active"
      );
    }

    if (!currentUserProgress.hearts) {
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        { error: "hearts" },
        "No hearts available"
      );
    }

    await mutateHeartQuery(currentUserProgress, "reduce");
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      null,
      "hearts reduced successfully"
    );
  } catch (error) {
    next(error);
  }
};
export const refillHeart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;

  try {
    const currentUserProgress = await fetchUserProgress(userId);

    if (!currentUserProgress) {
      throw new NotFoundError("User progress not found.");
    }

    if (currentUserProgress.points < POINTS_TO_REFILL) {
      return new BadRequestError("Not enough points to refill hearts");
    }

    await mutateHeartQuery(currentUserProgress, "refill");
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      null,
      "hearts refilled successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getUserSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;

  try {
    const userSubscription = await fetchUserSubscription(userId);
    sendSuccessResponse(res, HTTP_STATUS.OK, userSubscription);
  } catch (error) {
    next(error);
  }
};

export const getTopTenUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchTopTenUsers();
    sendSuccessResponse(res, HTTP_STATUS.OK, data);
  } catch (error) {
    next(error);
  }
};
