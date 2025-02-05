import { generateDynamicSchema, type FieldTypes } from "@/lib/utils/schema";
import type { NextFunction, Request, Response } from "express";
import { ZodObject, type AnyZodObject } from "zod";

export const validateRequestBody = (
  schemaDefinition: AnyZodObject | FieldTypes
) => {
  const schema =
    schemaDefinition instanceof ZodObject
      ? schemaDefinition
      : generateDynamicSchema(schemaDefinition);
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      // if (error instanceof ZodError) {
      //   const validationErrors = error.errors.map((err) => ({
      //     path: err.path.join("."),
      //     message: err.message,
      //   }));
      //   return res
      //     .status(400)
      //     .json(
      //       createApiError(
      //         400,
      //         "Validation Error",
      //         JSON.stringify(validationErrors)
      //       )
      //     );
      // }
      return next(error);
    }
  };
};

export const validateParams = (schemaDefinition: AnyZodObject | FieldTypes) => {
  const schema =
    schemaDefinition instanceof ZodObject
      ? schemaDefinition
      : generateDynamicSchema(schemaDefinition);
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedParams = await schema.parseAsync(req.params);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const validateQuery = (schemaDefinition: AnyZodObject | FieldTypes) => {
  const schema =
    schemaDefinition instanceof ZodObject
      ? schemaDefinition
      : generateDynamicSchema(schemaDefinition);
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedQuery = await schema.parseAsync(req.query);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
