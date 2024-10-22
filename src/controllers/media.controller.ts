import { fetchMedia, insertMedia } from "@/db/queries";
import type { NextFunction, Request, Response } from "express";

export const getMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchMedia();
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const postMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    await insertMedia(payload);
    res.json();
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
