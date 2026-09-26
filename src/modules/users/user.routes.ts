import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { resolveTenant, TenantRequest } from "../../middleware/tenant";
import { requirePermission } from "../../middleware/authorization";

const router = Router();

router.get(
  "/",
  authenticate,
  resolveTenant,
  requirePermission("user.manage"),
  async (req: TenantRequest, res, next) => {
    try {
      const users = await prisma.membership.findMany({
        where: {
          organizationId: req.tenant!.organizationId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              active: true
            }
          }
        }
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

export default router;