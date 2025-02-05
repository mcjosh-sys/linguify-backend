import { fetchMedia, insertMedia } from "@/lib/db/queries";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type { CreateMediaReqBody } from "@/schemas/media.schema";
import type { NextFunction, Request, Response } from "express";

export const getMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchMedia();
    sendSuccessResponse(res, HTTP_STATUS.OK, data);
  } catch (error) {
    next(error);
  }
};

export const postMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload: CreateMediaReqBody = req.body;
    await insertMedia(payload);
    sendSuccessResponse(res, HTTP_STATUS.CREATED, "Media added successfully");
  } catch (error) {
    next(error);
  }
};
