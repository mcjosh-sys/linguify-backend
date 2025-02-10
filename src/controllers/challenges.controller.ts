import {
  fetchChallenge,
  fetchChallengeById,
  fetchChallengeProgress,
  fetchChallenges,
  fetchLessonById,
  fetchUserProgress,
  mutateChallenge,
  upsertChallengeProgress,
} from "@/lib/db/queries";
import type { challenges, lessons } from "@/lib/db/schema";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type {
  CreateChallengeProgressReqBody,
  CreateChallengeReqBody,
  UpdateChallengeReqBody,
} from "@/schemas/challenge.schema";
import type { NextFunction, Request, Response } from "express";

const challengeResolver = (reqBody: any): typeof challenges.$inferInsert => {
  const { type, question, order, lessonId } = reqBody;

  return {
    type,
    question,
    order,
    lessonId,
  };
};

export const getChallengeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId: number = req.validatedParams.challengeId;
  const { userId } = req.params;
  try {
    const challenge = await fetchChallenge(challengeId);
    if (!challenge) {
      throw new NotFoundError("Challenge not found.");
    }
    const challengeProgress = await fetchChallengeProgress(userId, challengeId);
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      challengeProgress,
      "Challenge progress retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const insertChallengeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId: number = req.validatedParams.challengeId;

  const { userId }: CreateChallengeProgressReqBody = req.body;

  try {
    const currentUserProgress = await fetchUserProgress(userId);

    if (!currentUserProgress) {
      throw new NotFoundError("User progress not found.");
    }

    const challenge = await fetchChallenge(challengeId);

    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    await upsertChallengeProgress(challengeId, currentUserProgress);
    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      null,
      "Challenge progress inserted successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const updateChallengeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId: number = req.validatedParams.challengeId;

  const { userId }: CreateChallengeProgressReqBody = req.body;

  try {
    const currentUserProgress = await fetchUserProgress(userId);

    if (!currentUserProgress) {
      throw new NotFoundError("User progress not found.");
    }

    const challenge = await fetchChallenge(challengeId);

    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    const existingChallengeProgress = await fetchChallengeProgress(
      userId,
      challengeId
    );

    await upsertChallengeProgress(
      challengeId,
      currentUserProgress,
      existingChallengeProgress
    );
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      null,
      "Challenge progress updated successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const getChallenges = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchChallenges();
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Challenges retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const getChallengeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId: number = req.validatedParams.challengeId;

  try {
    const data = await fetchChallengeById(challengeId);
    console.log({data})
    if (!data) {
      throw new NotFoundError("Challenge not found.");
    }
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      data,
      "Challenge retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const createChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeData: CreateChallengeReqBody = req.body;

  try {
    const lesson = await fetchLessonById(challengeData.lessonId);
    if (!lesson) {
      throw new BadRequestError("Invalid lessonId");
    }

    await mutateChallenge("create", { challenge: challengeData });
    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      null,
      "Challenge created successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const updateChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId: number = req.validatedParams.challengeId;
  const challengeData: UpdateChallengeReqBody = req.body;

  try {
    let lesson: (typeof lessons.$inferInsert & { courseId: number }) | null =
      null;
    if (challengeData.lessonId)
      lesson = await fetchLessonById(challengeData.lessonId);

    const challenge = await fetchChallengeById(challengeId);

    if (!challenge) {
      throw new NotFoundError("Challenge not found.");
    }

    if (challengeData.lessonId && !lesson) {
      throw new BadRequestError("Invalid lessonId");
    }

    await mutateChallenge("update", { challenge: challengeData, challengeId });
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      null,
      "Challenge updated successfully."
    );
  } catch (error) {
    next(error);
  }
};
export const deleteChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId: number = req.validatedParams.challengeId;

  try {
    const challenge = await fetchChallengeById(challengeId);

    if (!challenge) {
      throw new NotFoundError("Challenge not found.");
    }

    await mutateChallenge("delete", { challengeId });
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      null,
      "Challenge deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};
