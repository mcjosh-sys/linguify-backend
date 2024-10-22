import express from "express";
import { clerkWebhook, stripeWebhook } from "../controllers/webhooks.controller";

const router = express.Router()

router.post(
  "/stripe",
  stripeWebhook
);
router.post("/clerk", clerkWebhook)

export default router 