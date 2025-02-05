import { fetchUserSubscription } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type { CreateStripeUrlReqBody } from "@/schemas/subscription.schema";
import type { NextFunction, Request, Response } from "express";

const returnUrl = absoluteUrl("/shop");

export const createStripeUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId: string = req.validatedParams.userId;
  const { email }: CreateStripeUrlReqBody = req.body;

  try {
    const userSubscription = await fetchUserSubscription(userId);
    if (userSubscription?.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: returnUrl,
      });
      return sendSuccessResponse(res, HTTP_STATUS.OK, stripeSession.url);
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
    sendSuccessResponse(res, HTTP_STATUS.OK, stripeSession.url);
  } catch (error) {
    next(error);
  }
};
