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
  requirePermission("audit.read"),
  async (req: TenantRequest, res, next) => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          organizationId: req.tenant!.organizationId
        },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 100
      });

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

export default router;