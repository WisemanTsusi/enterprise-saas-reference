import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { prisma } from "../lib/prisma";
import { ForbiddenError } from "../lib/errors";

export interface TenantRequest extends AuthenticatedRequest {
  tenant?: {
    organizationId: string;
    workspaceId?: string;
  };
}

export async function resolveTenant(
  req: TenantRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new ForbiddenError("User context missing");
    }

    const organizationId = req.headers["x-organization-id"] as string;

    if (!organizationId) {
      throw new ForbiddenError("Organization context required");
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        organizationId,
        status: "ACTIVE"
      }
    });

    if (!membership) {
      throw new ForbiddenError("User does not belong to this organization");
    }

    req.tenant = {
      organizationId,
      workspaceId: membership.workspaceId ?? undefined
    };

    next();
  } catch (error) {
    next(error);
  }
}