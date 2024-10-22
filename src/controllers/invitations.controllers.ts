import db from "@/db/drizzle";
import { invitations } from "@/db/schema";
import { clerkClient } from "@/lib/clerk";
import logger from "@/lib/uitls/logger";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const getInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status as 'pending' | 'accepted' | 'revoked' | undefined
  try {
    const invitations = await clerkClient.invitations.getInvitationList()
    res.json(invitations);
    next()
  } catch (error) {
    logger.error(error, "[GET_INVITATIONS]");
    res.status(500).json("Internal Server Error.");
    next(error);
  }
};

export const createInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params
  const { email } = req.body;

  

  try {
   await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.FRONTEND_URL+'/signup',
      publicMetadata: {
        isInvited: true,
        invitationEmail: email
      },
    });
    res.json("Intivation created successfully.");
  } catch (error: any) {
    logger.error(error);
    if (error.status === 422 || error.status === 400) {
      res.status(400).json("Email address already exists.");
    } else {
      res.status(500).json("Internal Server Error.");
    }
  }
  next();
};

export const revokeInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { invitationId } = req.params;
  try {
    await db.delete(invitations).where(eq(invitations.id, invitationId));
    res.json("Invitation revoked successfully.");
  } catch (error: any) {
    res.status(500).json("Internal Server Error.");
  }
  next();
};
