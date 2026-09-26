import { Response, NextFunction } from "express";
import { TenantRequest } from "./tenant";
import { prisma } from "../lib/prisma";
import { ForbiddenError } from "../lib/errors";
import { hasPermission } from "../policies/policy-engine";

export function requirePermission(permission: string) {
  return async (
    req: TenantRequest,
    _res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.tenant) {
        throw new ForbiddenError();
      }

      const membership = await prisma.membership.findFirst({
        where: {
          userId: req.user.id,
          organizationId: req.tenant.organizationId,
          status: "ACTIVE"
        }
      });

      if (!membership) {
        throw new ForbiddenError();
      }

      const allowed = hasPermission({
        role: membership.role,
        userOrganizationId: req.tenant.organizationId,
        resourceOrganizationId: req.tenant.organizationId
      });

      if (!allowed) {
        throw new ForbiddenError(
          `Missing permission: ${permission}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}