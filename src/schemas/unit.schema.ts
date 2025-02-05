import * as z from "zod";

export const unitSchema = z.object({
  title: z.string().min(1, "Unit title is required."),
  description: z.string().min(1, "Unit description is required."),
  courseId: z.number(),
  order: z.number(),
});

export type CreateUnitReqBody = z.infer<typeof unitSchema>;
export type UpdateUnitReqBody = Partial<CreateUnitReqBody>;
