import db from "@/db/drizzle";
import {
  checkIfAdmin,
  checkIfStaff,
  fetchCourseById,
  fetchStaff,
} from "@/db/queries";
import logger from "@/lib/uitls/logger";
import type { NextFunction, Request, Response } from "express";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const data = await checkIfAdmin(userId);
    res.json({ isAdmin: data });
    next();
  } catch (error) {
    logger.error(error, "[IS_ADMIN]");
    res.status(500).json("Internal Server Error");
    next(error);
  }
};
export const isStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const data = await checkIfStaff(userId);
    res.json({ isStaff: data });
    next();
  } catch (error) {
    logger.error(error, "[IS_STAFF]");
    res.status(500).json("Internal Server Error");
    next(error);
  }
};

export const hasPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.query.userId as string;
  const courseId = parseInt(req.query.courseId as string);

  if (!userId) {
    res.send(400).json("missing userId");
    return next();
  }

  try {
    const staff = await fetchStaff(userId);

    if (!staff) {
      res.status(404).json(`staff with the userId of ${userId} not found.`);
      return next();
    }

    if (staff?.role === "ADMIN") {
      res.status(200).json({ hasPermission: true });
      return next();
    }

    if (!courseId) {
      res.send(400).json("missing userId");
      return next();
    }

    const course = await fetchCourseById(courseId);

    if (!course) {
      res
        .status(404)
        .json(`course with the courseId of ${courseId} not found.`);
      return next();
    }

    const hasPermission = !!staff.permissions.find(
      (perm) => perm.courseId === courseId
    );

    res.json({ hasPermission });
    next();
  } catch (error) {
    logger.error(error, "[HAS_PERMISSION]");
    res.status(500).json("internal server error");
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

    res.json(data);
    next();
  } catch (error) {
    logger.error(error, "[GET_TEAM]");
    res.status(500).json("Internal Server Error");
    next(error);
  }
};
