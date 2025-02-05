import * as z from "zod";

export const userProgressSchema = z.object({
  activeCourseId: z.number(),
});

export const getLessonParamsSchema = z.object({
    userId: z.string(),
    lessonId: z.number().optional(),
})

export type UserProgressReqBody = z.infer<typeof userProgressSchema>;
export type GetLessonParams = z.infer<typeof getLessonParamsSchema>;
