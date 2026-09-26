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
  requirePermission("workspace.read"),
  async (req: TenantRequest, res, next) => {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          organizationId: req.tenant!.organizationId
        },
        orderBy: {
          name: "asc"
        }
      });

      res.json(workspaces);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authenticate,
  resolveTenant,
  requirePermission("workspace.manage"),
  async (req: TenantRequest, res, next) => {
    try {
      const workspace = await prisma.workspace.create({
        data: {
          organizationId: req.tenant!.organizationId,
          name: req.body.name,
          slug: req.body.slug
        }
      });

      await writeAuditLog({
        actorId: req.user!.id,
        organizationId: workspace.organizationId,
        action: "WORKSPACE_CREATED",
        resource: "Workspace",
        resourceId: workspace.id
      });

      res.status(201).json(workspace);
    } catch (error) {
      next(error);
    }
  }
);

export default router;