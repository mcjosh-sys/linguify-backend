import type { challengeOptions, challenges } from "@/lib/db/schema";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type {
  CreateChallengeOptionReqBody,
  UpdateChallengeOptionReqBody,
} from "@/schemas/challenge-option.schema";
import type { NextFunction, Request, Response } from "express";
import {
  fetchChallengeById,
  fetchChallengeOptionById,
  fetchChallengeOptions,
  mutateChallengeOption,
} from "../lib/db/queries";

const challengeOptionResolver = (
  reqBody: any
): typeof challengeOptions.$inferInsert => {
  const { challengeId, text, correct, imageSrc, audioSrc } = reqBody;
  return {
    challengeId,
    text,
    correct,
    imageSrc,
    audioSrc,
  };
};

// CHALLENGE OPTION
export const getChallengeOptions = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchChallengeOptions();
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Challenge options fetched successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const getChallengeOptionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeOptionId: number = req.validatedParams.challengeOptionId;

  try {
    const data = await fetchChallengeOptionById(challengeOptionId);
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Challenge option fetched successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const createChallengeOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeOptionData: CreateChallengeOptionReqBody = req.body;

  try {
    const challenge = await fetchChallengeById(challengeOptionData.challengeId);

    if (!challenge) {
      throw new BadRequestError(`Invalid challengeId`);
    }

    await mutateChallengeOption("create", {
      challengeOption: challengeOptionData,
    });
    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      null,
      "Challenge option created successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const updateChallengeOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeOptionId: number = req.validatedParams.challengeOptionId;

  const challengeOptionData: UpdateChallengeOptionReqBody = req.body;

  try {
    let challenge:
      | (typeof challenges.$inferInsert & { courseId: number })
      | null = null;

    if (challengeOptionData.challengeId)
      challenge = await fetchChallengeById(challengeOptionData.challengeId);

    if (challengeOptionData.challengeId && !challenge) {
      throw new BadRequestError(`Invalid challengeId`);
    }

    const challengeOption = await fetchChallengeOptionById(challengeOptionId);

    if (!challengeOption) {
      throw new NotFoundError(
        `Challenge option with id ${challengeOptionId} not found`
      );
    }

    await mutateChallengeOption("update", {
      challengeOption: challengeOptionData,
      challengeOptionId,
    });
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      null,
      "Challenge option updated successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const deleteChallengeOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeOptionId: number = req.validatedParams.challengeOptionId;

  try {
    const challengeOption = await fetchChallengeOptionById(challengeOptionId);
    if (!challengeOption) {
      throw new NotFoundError(
        `Challenge option with id ${challengeOptionId} not found`
      );
    }
    await mutateChallengeOption("delete", {
      challengeOptionId,
    });
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      null,
      "Challenge option deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};
