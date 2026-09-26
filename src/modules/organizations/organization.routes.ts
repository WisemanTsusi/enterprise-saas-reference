import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { resolveTenant, TenantRequest } from "../../middleware/tenant";
import { requirePermission } from "../../middleware/authorization";
import { writeAuditLog } from "../../services/audit.service";

const router = Router();

router.get(
  "/",
  authenticate,
  resolveTenant,
  requirePermission("organization.read"),
  async (req: TenantRequest, res, next) => {
    try {
      const organization = await prisma.organization.findUnique({
        where: {
          id: req.tenant!.organizationId
        },
        include: {
          workspaces: true,
          subscription: {
            include: {
              plan: true
            }
          }
        }
      });

      res.json(organization);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/",
  authenticate,
  resolveTenant,
  requirePermission("organization.update"),
  async (req: TenantRequest, res, next) => {
    try {
      const organization = await prisma.organization.update({
        where: {
          id: req.tenant!.organizationId
        },
        data: {
          name: req.body.name
        }
      });

      await writeAuditLog({
        actorId: req.user!.id,
        organizationId: organization.id,
        action: "ORGANIZATION_UPDATED",
        resource: "Organization",
        resourceId: organization.id,
        metadata: {
          name: organization.name
        }
      });

      res.json(organization);
    } catch (error) {
      next(error);
    }
  }
);

export default router;