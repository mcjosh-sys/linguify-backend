import { z } from "zod";
import type { Request } from "express";

export const validateId = (id: string | undefined): number | null => {
  if (!id) return null;
  const parsed = parseInt(id);
  return isNaN(parsed) ? null : parsed;
};

export const validateUserId = (req: Request): string | null => {
  const userId = req.params.userId || req.body.userId;
  return userId || null;
};

export const validatePagination = (req: Request) => {
  const schema = z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().default(10),
  });

  const result = schema.safeParse(req.query);
  return result.success ? result.data : { page: 1, limit: 10 };
};

export const validateRequiredFields = <T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): boolean => {
  return requiredFields.every(field => {
    const value = data[field];
    return value !== undefined && value !== null && value !== "";
  });
};
