import express from "express";
import organizationRoutes from "./modules/organizations/organization.routes";
import workspaceRoutes from "./modules/workspaces/workspace.routes";
import userRoutes from "./modules/users/user.routes";
import billingRoutes from "./modules/billing/billing.routes";
import auditRoutes from "./modules/audit/audit.routes";
import administrationRoutes from "./modules/administration/administration.routes";
import authRoutes from "./modules/auth/auth.routes";
import { AppError } from "./lib/errors";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "enterprise-saas-reference"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/admin", administrationRoutes);

app.use(
  (
    error: Error | AppError,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Internal server error"
    });
  }
);

export default app;