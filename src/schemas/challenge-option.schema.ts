import * as z from "zod";

export const challengeOptionSchema = z.object({
  challengeId: z.number(),
  text: z.string(),
  correct: z.boolean(),
  imageSrc: z.string().url(),
  audioSrc: z.string().url(),
});

export type CreateChallengeOptionReqBody = z.infer<
  typeof challengeOptionSchema
>;
export type UpdateChallengeOptionReqBody = Partial<CreateChallengeOptionReqBody>;
