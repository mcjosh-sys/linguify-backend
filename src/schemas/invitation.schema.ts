import * as z from "zod";

export const invitationSchema = z.object({
  email: z.string().email(),
});

export const invitationQuerySchema = z
  .object({
    page: z
      .string()
      .refine((val) => !isNaN(Number(val)), "Invalid number")
      .transform(Number)
      .optional(),
    limit: z
      .string()
      .refine((val) => !isNaN(Number(val)), "Invalid number")
      .transform(Number)
      .optional(),
    status: z
      .union([
        z.literal("pending"),
        z.literal("accepted"),
        z.literal("revoked"),
      ])
      .optional(),
  })
  .passthrough();

export type CreateInvitationReqBody = z.infer<typeof invitationSchema>;
export type GetInvitationReqQuery = z.infer<typeof invitationQuerySchema>;
