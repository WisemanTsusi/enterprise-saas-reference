import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { resolveTenant, TenantRequest } from "../../middleware/tenant";
import { requirePermission } from "../../middleware/authorization";

const router = Router();

router.get(
  "/organizations",
  authenticate,
  resolveTenant,
  requirePermission("organization.read"),
  async (_req: TenantRequest, res, next) => {
    try {
      const organizations = await prisma.organization.findMany({
        include: {
          subscription: {
            include: {
              plan: true
            }
          },
          _count: {
            select: {
              memberships: true,
              workspaces: true
            }
          }
        }
      });

      res.json(organizations);
    } catch (error) {
      next(error);
    }
  }
);

export default router;