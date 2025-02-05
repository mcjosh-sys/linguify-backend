import { checkIfPermitted } from "@/lib/db/queries";
import { ForbiddenError } from "@/lib/errors";
import type { NextFunction, Request, Response } from "express";

export const checkPermission = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const hasPermission = await checkIfPermitted(req.validatedParams.userId);
        if (!hasPermission) {
            throw new ForbiddenError("Your are not authorized to perform this operation.")
        }
      return next();
    } catch (error) {
      return next(error);
    }
  };
