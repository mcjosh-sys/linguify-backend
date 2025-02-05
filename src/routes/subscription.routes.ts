import { validateParams, validateRequestBody } from "@/middleware/validation";
import { stripeSchema } from "@/schemas/subscription.schema";
import { Router } from "express";
import { createStripeUrl } from "../controllers/subscription.controller";

const router = Router();

router.post(
  "/:userId/create-stripe-url",
  validateParams({ userId: "string" }),
  validateRequestBody(stripeSchema),
  createStripeUrl
);

export default router;
