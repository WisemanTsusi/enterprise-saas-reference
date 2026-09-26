import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { resolveTenant, TenantRequest } from "../../middleware/tenant";
import { requirePermission } from "../../middleware/authorization";

const router = Router();

router.get(
  "/subscription",
  authenticate,
  resolveTenant,
  requirePermission("billing.read"),
  async (req: TenantRequest, res, next) => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: {
          organizationId: req.tenant!.organizationId
        },
        include: {
          plan: {
            include: {
              features: {
                include: {
                  feature: true
                }
              }
            }
          }
        }
      });

      res.json(subscription);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/invoices",
  authenticate,
  resolveTenant,
  requirePermission("billing.read"),
  async (req: TenantRequest, res, next) => {
    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          subscription: {
            organizationId: req.tenant!.organizationId
          }
        },
        orderBy: {
          issuedAt: "desc"
        }
      });

      res.json(invoices);
    } catch (error) {
      next(error);
    }
  }
);

export default router;