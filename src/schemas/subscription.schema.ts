import * as z from 'zod';

export const stripeSchema = z.object({
  email: z.string().email(),
});

export type CreateStripeUrlReqBody = z.infer<typeof stripeSchema>;