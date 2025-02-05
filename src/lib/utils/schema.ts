import * as z from "zod";
type FieldType = "string" | "uuid" | "number" | "boolean" | "date";

export type FieldTypes = Record<string, FieldType>;

export const generateDynamicSchema = (fields: FieldTypes) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  for (const [fieldName, fieldType] of Object.entries(fields)) {
    switch (fieldType) {
      case "string":
        schemaFields[fieldName] = z
          .string()
          .min(1, `${fieldName} must be a non-empty string`);
        break;
      case "uuid":
        schemaFields[fieldName] = z
          .string()
          .uuid(`${fieldName} must be a valid UUID`);
        break;
      case "number":
        schemaFields[fieldName] = z
          .string()
          .regex(/^\d+$/, `${fieldName} must be a valid number`)
          .transform((val) => parseInt(val, 10));
        break;
      case "boolean":
        schemaFields[fieldName] = z.boolean();
        break;
      case "date":
        schemaFields[fieldName] = z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: `${fieldName} must be a valid date`,
          });
        break;
      default:
        throw new Error(`Unsupported field type: ${fieldType}`);
    }
  }

  return z.object(schemaFields);
};
