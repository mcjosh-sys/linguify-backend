import {
  fetchLessonById,
  fetchLessons,
  fetchUnitById,
  mutateLesson,
} from "@/lib/db/queries";
import { lessons } from "@/lib/db/schema";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type {
  CreateLessonReqBody,
  UpdateLessonReqBody,
} from "@/schemas/lesson.schema";
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
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Lessons retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lessonId: number = req.validatedParams.lessonId;

  try {
    const data = await fetchLessonById(lessonId);
    if (!data) {
      throw new NotFoundError("Lesson not found.");
    }
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Lesson retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lessonData: CreateLessonReqBody = req.body;

  try {
    const unit = await fetchUnitById(lessonData.unitId);
    if (!unit) {
      throw new BadRequestError(
        `No unit with the id '${lessonData.unitId}' found.`
      );
    }

    await mutateLesson("create", { lesson: lessonData });
    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      undefined,
      "Lesson created successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lessonId: number = req.validatedParams.lessonId;

  let lessonData: UpdateLessonReqBody = req.body;

  try {
    const lesson = await fetchLessonById(lessonId);

    if (!lesson) {
      throw new NotFoundError("Lesson not found.");
    }

    const unit = await fetchUnitById(lessonData.unitId!);

    if (lessonData.unitId && !unit) {
      throw new BadRequestError(
        `No unit with the id '${lessonData.unitId}' found.`
      );
    }

    await mutateLesson("update", { lesson: lessonData, lessonId });
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      undefined,
      "Lesson updated successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lessonId: number = req.validatedParams.lessonId;

  try {
    const lesson = await fetchLessonById(lessonId);

    if (!lesson) {
      throw new NotFoundError("Lesson not found.");
    }
    await mutateLesson("delete", { lessonId });
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      undefined,
      "Lesson deleted successfully."
    );
  } catch (error) {
    res.status(500).json("Internal Server Error.");
    next(error);
  }
};
