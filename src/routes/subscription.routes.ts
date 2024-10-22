import { Router } from "express";
import { createStripeUrl } from "../controllers/subscription.controller";

const router = Router()

router.post('/:userId/create-stripe-url', createStripeUrl)

export default router