import * as z from "zod";

export const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  unitId: z.number(),
  order: z.number(),
});

export type CreateLessonReqBody = z.infer<typeof lessonSchema>;
export type UpdateLessonReqBody = Partial<CreateLessonReqBody>;
