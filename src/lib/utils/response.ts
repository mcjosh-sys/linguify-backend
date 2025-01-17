import type { Response } from "express";
import { createApiError, createApiResponse } from "@/types/api";
import logger from "./logger";

export const sendErrorResponse = (res: Response, status: number, message: string, error?: unknown) => {
  if (error) {
    logger.error(error, message);
  }
  res.status(status).json(createApiError(message));
};

export const sendSuccessResponse = <T>(res: Response, status: number, data?: T, message?: string) => {
  res.status(status).json(createApiResponse({ data, message }));
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not Found",
  INVALID_INPUT: "Invalid Input",
  MISSING_FIELDS: "Required fields are missing",
} as const;
