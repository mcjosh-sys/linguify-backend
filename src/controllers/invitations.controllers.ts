import { clerkClient } from "@/lib/clerk";
import db from "@/lib/db/drizzle";
import { invitations } from "@/lib/db/schema";
import { HTTP_STATUS, sendSuccessResponse } from "@/lib/utils/response";
import type {
  CreateInvitationReqBody,
  GetInvitationReqQuery,
} from "@/schemas/invitation.schema";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const getInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, status }: GetInvitationReqQuery = req.validatedQuery;

  try {
    const invitations = await clerkClient.invitations.getInvitationList();
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      invitations,
      "Invitations fetched successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const createInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email }: CreateInvitationReqBody = req.body;

  try {
    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.FRONTEND_URL + "/signup",
      publicMetadata: {
        isInvited: true,
        invitationEmail: email,
      },
    });
    sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      {},
      "Invitation sent successfully."
    );
  } catch (error: any) {
    next(error);
    // if (error.status === 422 || error.status === 400) {
    //   res.status(400).json("Email address already exists.");
    // } else {
    //   res.status(500).json("Internal Server Error.");
    // }
  }
};

export const revokeInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { invitationId } = req.params;
  try {
    await db.delete(invitations).where(eq(invitations.id, invitationId));
    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      {},
      "Invitation revoked successfully."
    );
  } catch (error: any) {
    next(error);
  }
};
