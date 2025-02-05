import {
  fetchCourseById,
  fetchUnitById,
  fetchUnits2,
  mutateUnit,
} from "@/lib/db/queries";
import type { units } from "@/lib/db/schema";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type { CreateUnitReqBody } from "@/schemas/unit.schema";
import type { NextFunction, Request, Response } from "express";

const unitResolver = (reqBody: any): typeof units.$inferInsert => {
  const { title, description, order } = reqBody;

  const courseId = parseInt(reqBody.courseId);

  return {
    title,
    description,
    order,
    courseId,
  };
};

export const getUnits = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchUnits2();
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Units successfully retrieved."
    );
  } catch (error) {
    next(error);
  }
};

export const getUnitById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitId: number = req.validatedParams.unitId;

  try {
    const data = await fetchUnitById(unitId);
    if (!data) {
      throw new NotFoundError("Unit not found.");
    }
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Unit retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitData: CreateUnitReqBody = req.body;

  try {
    const course = await fetchCourseById(unitData.courseId);
    if (!course) {
      throw new BadRequestError("Invalid course id.");
    }

    await mutateUnit("create", { unit: unitData });
    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      {},
      "Unit created successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const updateUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitId: number = req.validatedParams.unitId;
  const unitData: CreateUnitReqBody = req.body;

  const courseId = unitData.courseId;

  try {
    let unit: typeof units.$inferSelect | undefined;
    if (!courseId) {
      unit = await fetchUnitById(unitId);
    }
    const course = await fetchCourseById(courseId || unit?.courseId!);
    if (courseId && !course) {
      throw new BadRequestError("Invalid course id.");
    }

    await mutateUnit("update", { unit: unitData, unitId });
    sendSuccessResponse(res, HTTP_STATUS.OK, {}, "Unit updated successfully.");
  } catch (error) {
    next(error);
  }
};
export const deleteUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitId: number = req.validatedParams.unitId;

  try {
    const unit = await fetchUnitById(unitId);

    if (!unit) {
      throw new BadRequestError("Invalid unit it.");
    }
    await mutateUnit("delete", { unitId: unit.id });
    sendSuccessResponse(res, HTTP_STATUS.OK, {}, "Unit deleted successfully.");
  } catch (error) {
    next(error);
  }
};
