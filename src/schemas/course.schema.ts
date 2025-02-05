import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageSrc: z.string().url("Invalid image URL"),
  description: z.string().optional(),
});

export type CreateCourseReqBody = z.infer<typeof courseSchema>;
export type UpdateCourseReqBody = Partial<CreateCourseReqBody>;
