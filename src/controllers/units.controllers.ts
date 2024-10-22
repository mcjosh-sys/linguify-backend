import { checkIfPermitted, fetchCourseById, fetchUnitById, fetchUnits2, mutateUnit } from "@/db/queries";
import type { units } from "@/db/schema";
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
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const getUnitById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitId = parseInt(req.params.unitId);

  if (!unitId) {
    res.status(404).json("Not Found");
    return next();
  }
  try {
    const data = await fetchUnitById(unitId);
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json("Missing userId.");
    return next();
  }

  const unitData = unitResolver(req.body);

  if (Object.entries(unitData).some(([_, value]) => !value)) {
    res.status(400).json("Missing information in ther request body.");
    return next();
  }

  try {
    const course = await fetchCourseById(unitData.courseId)
    if (!course) {
      res.status(400).json(`Invalid course.`)
      return next()
    }

    const hasPermission = await checkIfPermitted(userId, unitData.courseId)

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateUnit('create', { unit: unitData })
    res.status(201).json("Unit has been created successfully.")
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const updateUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const unitId = parseInt(req.params.unitId);

  if (!userId || !unitId) {
    res.status(400).json("Missing userId or unitId.");
    return next();
  }

  const unitData = unitResolver(req.body);
  const courseId = unitData.courseId

  try {
    let unit: typeof units.$inferSelect | undefined;
    if (!courseId) {
      unit = await fetchUnitById(unitId)
    }
    const course = await fetchCourseById(courseId || unit?.courseId!);
    if (courseId && !course) {
      res.status(400).json(`Inavlid course.`);
      return next();
    }

    const hasPermission = await checkIfPermitted(userId, courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateUnit("update", { unit: unitData, unitId });
    res.json("Unit has been updated successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const deleteUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const unitId = parseInt(req.params.unitId);

  if (!userId || !unitId) {
    res.status(400).json("Missing userId or unitId.");
    return next();
  }

  try {
    const unit = await fetchUnitById(unitId)

    if (unit) {
      const hasPermission = await checkIfPermitted(userId, unit.courseId);
  
      if (!hasPermission) {
        res.json({ error: "permission" });
        return next();
      }
  
      await mutateUnit("delete", { unitId: unit.id });
    }
    res.json("Unit deleted successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
