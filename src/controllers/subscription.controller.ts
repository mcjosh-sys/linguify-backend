import type { NextFunction, Request, Response } from "express";
import { fetchUserSubscription } from "../db/queries";
import { stripe } from "../lib/stripe";
import { absoluteUrl } from "../lib/uitls";
import logger from "../lib/uitls/logger";

const returnUrl = absoluteUrl("/shop");

export const createStripeUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { email } = req.body;
  if (!userId) {
    res.sendStatus(401);
    next();
    return;
  }

  try {
    const userSubscription = await fetchUserSubscription(userId);
    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: returnUrl,
      });

      res.status(200).json({ data: stripeSession.url });
      next();
      return;
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "USD",
            product_data: {
              name: "Linguify Pro",
              description: "Unlimited hearts",
            },
            unit_amount: 2000, //$20 USD
            recurring: {
              interval: "month",
            },
          },
        },
      ],
      metadata: {
        userId,
      },
      success_url: returnUrl,
      cancel_url: returnUrl,
    });
    res.status(200).json({ data: stripeSession.url });
  } catch (error) {
    logger.error(error);
    res.status(500).json("Internal Server Error");
  }
  next();
};
