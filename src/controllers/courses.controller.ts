import { NotFoundError } from "@/lib/errors";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type {
  CreateCourseReqBody,
  UpdateCourseReqBody,
} from "@/schemas/course.schema";
import type { NextFunction, Request, Response } from "express";
import { fetchCourseById, fetchCourses, mutateCourse } from "../lib/db/queries";

// COURSE
export const getCourses = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courses = await fetchCourses();
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      courses,
      "Courses fetched successfully."
    );

    // res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(req.validatedParams);
  const courseId: number = req.validatedParams.courseId;
  try {
    const course = await fetchCourseById(courseId);

    if (!course) {
      throw new NotFoundError("Course not found.");
    }
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      course,
      "Course successfully retrieved."
    );
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, imageSrc }: CreateCourseReqBody = req.body;

  try {
    await mutateCourse("create", { title, imageSrc });
    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      {},
      "Course created successfully."
    );
    next();
  } catch (error) {
    next(error);
  }
};
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const courseId: number = req.validatedParams.courseId;
  const { title, imageSrc }: UpdateCourseReqBody = req.body;

  try {
    const course = await fetchCourseById(courseId);

    if (!course) {
      throw new NotFoundError(
        `Course with the id '${courseId}' does not exist.`
      );
    }

    await mutateCourse("update", { course: { title, imageSrc }, courseId });
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      {},
      "Course updated successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, courseId } = req.validatedParams;

  try {
    await mutateCourse("delete", courseId);
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      {},
      "Course deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};
