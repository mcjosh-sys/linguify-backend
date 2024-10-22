import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { Webhook } from "svix";
import db from "../db/drizzle";
import {
  invitations,
  organization,
  staff,
  users,
  userSubscription,
} from "../db/schema";
import { stripe } from "../lib/stripe";
import logger from "../lib/uitls/logger";

export const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    logger.error(`⚠️  Webhook signature verification failed.`, error.message);
    res.sendStatus(400);
    return next();
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log({ eventType: event.type });

    if (event.type === "checkout.session.completed") {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (!session?.metadata?.userId) {
        res.status(400).send("User Id is required");
        return next();
      }

      await db.insert(userSubscription).values({
        userId: session.metadata.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await db
        .update(userSubscription)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        })
        .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
    }
    res.status(200).end();
  } catch (error: any) {
    logger.error(error);
    res.status(500).json("Internal Server Error");
  }
  return next();
};

export const clerkWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("You need a WEBHOOK_SECRET in your .env");
  }

  const headers = req.headers;
  const body = req.body;

  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).send("Error occured -- no svix headers");
    return next();
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    });
  } catch (err: any) {
    console.log("Error verifying webhook:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const payload = evt.data;
  const eventType = evt.type;

  const eventTypes: { [type: string]: () => Promise<void> } = {
    "user.created": async () => {
      await db.insert(users).values({
        id: payload.id,
        userName: payload.username || "user",
        firstName: payload.first_name || "User",
        lastName: payload.last_name,
        avatarUrl: payload.image_url,
        email: payload.email_addresses[0].email_address,
      });
      if (payload.public_metadata.isInvited) {
        await db.insert;
      }
    },
    "user.updated": async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.id),
      });
      if (user) {
        await db
          .update(users)
          .set({
            userName: payload.username || "user",
            firstName: payload.first_name || "User",
            lastName: payload.last_name,
            avatarUrl: payload.image_url,
            email: payload.email_addresses[0].email_address,
          })
          .where(eq(users.id, payload.id));
      } else {
        await db.insert(users).values({
          id: payload.id,
          userName: payload.username || "user",
          firstName: payload.first_name || "User",
          lastName: payload.last_name,
          avatarUrl: payload.image_url,
          email: payload.email_addresses[0].email_address,
        });

        await db
          .update(invitations)
          .set({
            status: "ACCEPTED",
          })
          .where(
            eq(invitations.email, payload.public_metadata.invitationEmail)
          );
      }
    },
    "user.deleted": async () => {
      await db.delete(users).where(eq(users.id, payload.id));
    },
    "organization.created": async () => {
      const data = await db.query.organization.findFirst();
      if (!data) {
        await db.insert(organization).values({
          id: payload.id,
          name: payload.name,
          ownerId: payload.created_by,
        });
      }
      const existingStaff = await db.query.staff.findFirst({
        where: eq(staff.userId, payload.created_by),
      });
      if (existingStaff) {
        await db
          .update(staff)
          .set({
            role: "ADMIN",
          })
          .where(eq(staff.userId, payload.created_by));
      } else {
        await db.insert(staff).values({
          userId: payload.created_by,
          role: "STAFF",
        });
      }
    },
    "organization.updated": async () => {
      await db
        .update(organization)
        .set({
          name: payload.name,
        })
        .where(eq(organization.id, payload.id));
      const data = await db.query.staff.findFirst({
        where: eq(staff.userId, payload.created_by),
      });
      if (!data) {
        await db.insert(staff).values({
          userId: payload.created_by,
          role: "ADMIN",
        });
      }
    },
    "organization.deleted": async () => {
      const org = await db.query.organization.findFirst({
        where: eq(organization.id, payload.id),
      });
      await db.delete(organization).where(eq(organization.id, payload.id));
      if (org) {
        await db.delete(staff);
      }
    },
  };

  try {
    eventTypes[eventType] && eventTypes[eventType]();
  } catch (error) {
    console.log(error);
  }
  logger.info(`Webhook with an ID of ${payload.id} and type of ${eventType}`);
  logger.info(evt.data, "Webhook body: ");

  res.status(200).json({
    success: true,
    message: "Webhook received",
  });
  next();
};
