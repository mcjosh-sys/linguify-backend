import type { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError, ValidationError } from "@/lib/errors";
import { createApiError } from "@/types/api";
import { ZodError } from "zod";
import logger  from "@/lib/utils/logger";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(error);

  if (error instanceof ValidationError) {
    return res.status(400).json(
      createApiError("Validation Error", JSON.stringify(error.errors))
    );
  }

  if (error instanceof BadRequestError) {
    return res.status(400).json(
      createApiError("Bad Request", error.message)
    );
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json(
      createApiError("Not Found", error.message)
    );
  }

  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json(
      createApiError("Validation Error", JSON.stringify(validationErrors))
    );
  }

  // Default error
  return res.status(500).json(
    createApiError(
      "Internal Server Error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    )
  );
};
