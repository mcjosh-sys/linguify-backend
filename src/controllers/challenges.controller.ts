import type { challenges, lessons } from "@/db/schema";
import type { NextFunction, Request, Response } from "express";
import {
  checkIfPermitted,
  fetchChallenge,
  fetchChallengeById,
  fetchChallengeProgress,
  fetchChallenges,
  fetchLessonById,
  fetchUserProgress,
  mutateChallenge,
  upsertChallengeProgress,
} from "../db/queries";

const challengeResolver = (reqBody: any): typeof challenges.$inferInsert => {
  const { type, question, order, lessonId } = reqBody

  return {
    type, question, order, lessonId
  }
}

export const getChallengeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId = parseInt(req.params.challengeId);
  const { userId } = req.params;
  if (!userId) {
    res.status(401).json("Unauthorized");
    next();
    return;
  }
  try {
    const challenge = fetchChallenge(challengeId);
    if (!challenge) {
      res.status(404).send("Challenge not found");
      return next();
    }
    const challengeProgress = await fetchChallengeProgress(userId, challengeId);
    res.status(200).json(challengeProgress);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const insertChallengeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId = parseInt(req.params.challengeId);

  if (!challengeId) {
    res.status(404).json("Not Found");
    return next();
  }

  const { userId } = req.body;

  if (!userId) {
    res.sendStatus(401);
    next();
    return;
  }

  try {
    const currentUserProgress = await fetchUserProgress(userId);

    if (!currentUserProgress) {
      res.status(404).json("User progress not found.");
      return next();
    }

    const challenge = await fetchChallenge(challengeId);

    if (!challenge) {
      res.status(401).json("Challenge not found");
      return next();
    }

    await upsertChallengeProgress(challengeId, currentUserProgress!);
    res.status(201).json();
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};

export const updateChallengeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId = parseInt(req.params.challengeId);

  const { userId } = req.body;

  if (!userId) {
    res.sendStatus(401);
    next();
    return;
  }

  try {
    const currentUserProgress = await fetchUserProgress(userId);

    if (!currentUserProgress) {
      res.status(404).json("User progress not found.");
      return next();
    }

    const challenge = await fetchChallenge(challengeId);

    if (!challenge) {
      res.status(401).json("Challenge not found");
      return next();
    }

    const lessonId = challenge?.lessonId;

    const existingChallengeProgress = await fetchChallengeProgress(
      userId,
      challengeId
    );

    //   const isPractice = !!existingChallengeProgress

    //   if (currentUserProgress?.hearts === 0 && !isPractice) {

    //   }
    await upsertChallengeProgress(
      challengeId,
      currentUserProgress!,
      existingChallengeProgress
    );
    res.status(200).json();
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }

  next();
};

export const getChallenges = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchChallenges();
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const getChallengeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const challengeId = parseInt(req.params.challengeId);
  if (!challengeId) {
    res.status(404).json("Not Found");
    return next();
  }
  try {
    const data = await fetchChallengeById(challengeId);
    res.json(data);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
  next();
};
export const createChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json("Missing userId.");
    return next();
  }

  const challengeData = challengeResolver(req.body);

  if (
    Object.entries(challengeData).some(([_, value]) => !value)
  ) {
    res.status(400).json("Missing information in the request body.");
    return next();
  }

  try {
    const lesson = await fetchLessonById(challengeData.lessonId);
    if (!lesson) {
      res.status(400).json(`Invalid lessonId`);
      return next();
    }

    const hasPermission = await checkIfPermitted(userId, lesson.courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateChallenge("create", { challenge: challengeData });
    res.status(201).json("Challenge has been created successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const updateChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const challengeId = parseInt(req.params.challengeId)

  if (!userId || !challengeId) {
    res.status(400).json("Missing userId or challengeId.");
    return next();
  }

  const challengeData = challengeResolver(req.body);

  try {
    let lesson: typeof lessons.$inferInsert & {courseId: number} | undefined;
    if (challengeData.lessonId) lesson = await fetchLessonById(challengeData.lessonId);
    
    const challenge = await fetchChallengeById(challengeId)

    if (challengeData.lessonId && !lesson) {
      res.status(400).json(`Invalid lessonId`);
      return next();
    }

    const hasPermission = await checkIfPermitted(userId, lesson?.courseId || challenge.courseId);

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateChallenge("update", { challenge: challengeData, challengeId });
    res.status(201).json("Challenge has been updated successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
export const deleteChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const challengeId = parseInt(req.params.challengeId);

  if (!userId || !challengeId) {
    res.status(400).json("Missing userId or challendId.");
    return next();
  }

  try {
    const challenge = await fetchChallengeById(challengeId);

    const hasPermission = await checkIfPermitted(
      userId,
      challenge.courseId
    );

    if (!hasPermission) {
      res.json({ error: "permission" });
      return next();
    }

    await mutateChallenge("delete", { challengeId });
    res.status(201).json("Challenge has been deleted successfully.");
  } catch (error) {
    res.status(500).json("Internal Server Error.");
  }

  next();
};
