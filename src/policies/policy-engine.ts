import { RoleName } from "@prisma/client";

export interface PolicyContext {
  role: RoleName;
  userOrganizationId: string;
  resourceOrganizationId?: string;
  userDepartmentId?: string;
  resourceDepartmentId?: string;
}

const rolePermissions: Record<RoleName, string[]> = {
  PLATFORM_ADMIN: ["*"],

  ORGANIZATION_OWNER: [
    "organization.read",
    "organization.update",
    "workspace.manage",
    "user.manage",
    "billing.read",
    "audit.read"
  ],

  ORGANIZATION_ADMIN: [
    "organization.read",
    "workspace.manage",
    "user.manage",
    "billing.read",
    "audit.read"
  ],

  WORKSPACE_ADMIN: [
    "organization.read",
    "workspace.manage",
    "user.manage"
  ],

  MANAGER: [
    "organization.read",
    "workspace.read"
  ],

  MEMBER: [
    "organization.read",
    "workspace.read"
  ],

  VIEWER: [
    "organization.read",
    "workspace.read"
  ]
};

export function hasPermission(
  context: PolicyContext,
  permission: string
): boolean {
  const permissions = rolePermissions[context.role];

  if (permissions.includes("*")) {
    return true;
  }

  if (!permissions.includes(permission)) {
    return false;
  }

  if (
    context.resourceOrganizationId &&
    context.resourceOrganizationId !== context.userOrganizationId
  ) {
    return false;
  }

  if (
    context.userDepartmentId &&
    context.resourceDepartmentId &&
    context.userDepartmentId !== context.resourceDepartmentId
  ) {
    return false;
  }

  return true;
}