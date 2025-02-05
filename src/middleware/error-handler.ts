import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { createApiError, sendApiResponse } from "@/lib/utils/api";
import logger from "@/lib/utils/logger";
import { HTTP_STATUS } from "@/lib/utils/response";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

const sendError = (error: string) => {
  return process.env.NODE_ENV === "development" ? error : undefined;
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(error);

  if (error instanceof ValidationError) {
    return sendApiResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      createApiError(
        HTTP_STATUS.BAD_REQUEST,
        JSON.stringify(error.errors),
        "Validation Error",
      )
    );
  }

  if (error instanceof BadRequestError) {
    return sendApiResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      createApiError(
        HTTP_STATUS.BAD_REQUEST,
        error.message,
        "Bad Request",
      )
    );
  }

  if (error instanceof ForbiddenError) {
    return sendApiResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      createApiError(
        HTTP_STATUS.BAD_REQUEST,
        error.message,
        "Forbidden",
      )
    );
  }

  if (error instanceof NotFoundError) {
    return sendApiResponse(
      res,
      HTTP_STATUS.NOT_FOUND,
      createApiError(
        HTTP_STATUS.NOT_FOUND,
        error.message,
        "Not Found",
      )
    );
  }

  if (error instanceof ZodError) {
    // const validationErrors = error.errors.map((err) => ({
    //   path: err.path.join("."),
    //   message: err.message,
    // }));
    const validationErrors = error.errors.map((err) => `${err.path.join(", ")}: ${err.message}`).join(". ");
    return sendApiResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      createApiError(
        HTTP_STATUS.BAD_REQUEST,
        validationErrors,
        "Validation Error",
      )
    );
  }

  return sendApiResponse(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    createApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message,
      "Internal Server Error",
    )
  );
};
