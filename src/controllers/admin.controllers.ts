import db from "@/lib/db/drizzle";
import { checkIfAdmin, checkIfStaff } from "@/lib/db/queries";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type { NextFunction, Request, Response } from "express";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;

  try {
    const data = await checkIfAdmin(userId);
    sendSuccessResponse(res, HTTP_STATUS.OK, { isAdmin: data });
    next();
  } catch (error) {
    next(error);
  }
};

export const isStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;

  try {
    const data = await checkIfStaff(userId);
    sendSuccessResponse(res, HTTP_STATUS.OK, { isStaff: data });
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  try {
    const data = await db.query.staff.findMany({
      with: {
        user: true,
      },
      orderBy: (staff, { desc }) => [desc(staff.role)],
      // offset: (page - 1) * limit,
      // limit: limit,
    });

    sendSuccessResponse(res, HTTP_STATUS.OK, data);
  } catch (error) {
    next(error);
  }
};
