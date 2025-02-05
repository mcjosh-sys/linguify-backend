import * as z from "zod";

export const challengeSchema = z.object({
  type: z.union([z.literal("SELECT"), z.literal("ASSIST")]),
  question: z.string(),
  order: z.number(),
  lessonId: z.number(),
});

export const challengeProgressSchema = z.object({
  userId: z.string(),
});

export type CreateChallengeReqBody = z.infer<typeof challengeSchema>;
export type UpdateChallengeReqBody = Partial<CreateChallengeReqBody>;
export type CreateChallengeProgressReqBody = z.infer<
  typeof challengeProgressSchema
>;
