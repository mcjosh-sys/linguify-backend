import type { challengeOptions, challenges } from "@/db/schema";
import type { NextFunction, Request, Response } from "express";
import {
  checkIfPermitted,
  fetchChallengeById,
  fetchChallengeOptionById,
  fetchChallengeOptions,
  mutateChallengeOption,
} from "../db/queries";

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
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const getChallengeOptionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeOptionId = parseInt(req.params.challengeOptionId);
  if (!challengeOptionId) {
    res.status(404).json("Not Found");
    return next();
  }

  try {
    const data = await fetchChallengeOptionById(challengeOptionId);
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const createChallengeOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json("Missing userId.");
    return next();
  }

  const challengeOptionData = challengeOptionResolver(req.body);

  if (Object.entries(challengeOptionData).some(([key, value]) => key !== 'imageSrc' && !value)) {
    res.status(400).json("Missing information in the request body.");
    return next();
  }

  try {
    const challenge = await fetchChallengeById(challengeOptionData.challengeId);
    if (!challenge) {
      res.status(400).json(`Invalid challengeId`);
      return next();
    }

    const hasPermission = await checkIfPermitted(userId, challenge.courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateChallengeOption("create", {
      challengeOption: challengeOptionData,
    });
    res.status(201).json("Challenge option has been created successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const updateChallengeOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const challengeOptionId = parseInt(req.params.challengeOptionId);

  if (!userId || !challengeOptionId) {
    res.status(400).json("Missing userId or challengeOptionId.");
    return next();
  }

  const challengeOptionData = challengeOptionResolver(req.body);

  try {
    let challenge: (typeof challenges.$inferInsert) & { courseId: number } | undefined;
    
    if (challengeOptionData.challengeId)
      challenge = await fetchChallengeById(challengeOptionData.challengeId);

    if (challengeOptionData.challengeId && !challenge) {
      res.status(400).json(`Invalid challengeId`);
      return next();
    }
    
    const challengeOption = await fetchChallengeOptionById(challengeOptionId)

    const hasPermission = await checkIfPermitted(userId, challenge?.courseId || challengeOption.courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateChallengeOption("update", {
      challengeOption: challengeOptionData,
      challengeOptionId
    });
    res.json("Challenge option has been updated successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const deleteChallengeOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const challengeOptionId = parseInt(req.params.challengeOptionId);

  if (!userId || !challengeOptionId) {
    res.status(400).json("Missing userId or challengeOptionId.");
    return next();
  }

  try {

    const challengeOption = await fetchChallengeOptionById(challengeOptionId);

    const hasPermission = await checkIfPermitted(
      userId, challengeOption.courseId
    );

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateChallengeOption("delete", {
      challengeOptionId,
    });
    res.json("Challenge option has been deleted successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
