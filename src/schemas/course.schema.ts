import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageSrc: z.string().url('Invalid image URL'),
  description: z.string().optional(),
});

export const courseIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});

export type CreateCourseInput = z.infer<typeof courseSchema>;
export type UpdateCourseInput = Partial<CreateCourseInput>;
