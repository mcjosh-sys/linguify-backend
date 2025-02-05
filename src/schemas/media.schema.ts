import * as z from "zod";

export const mediaSchema = z.object({
  type: z.union([z.literal("AUDIO"), z.literal("IMAGE")]),
  src: z.string().url(),
  name: z.string().optional(),
});

export type CreateMediaReqBody = z.infer<typeof mediaSchema>;