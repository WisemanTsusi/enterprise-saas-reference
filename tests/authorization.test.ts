
## 🧪 Tests

### `tests/authorization.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { hasPermission } from "../src/policies/policy-engine";

describe("🛡️ Authorization", () => {
  it("allows organization admins to manage users", () => {
    expect(
      hasPermission({
        role: "ORGANIZATION_ADMIN",
        userOrganizationId: "org-1",
        resourceOrganizationId: "org-1"
      })
    ).toBe(true);
  });

  it("denies cross-tenant access", () => {
    expect(
      hasPermission({
        role: "ORGANIZATION_ADMIN",
        userOrganizationId: "org-1",
        resourceOrganizationId: "org-2"
      })
    ).toBe(false);
  });

  it("allows platform administrators", () => {
    expect(
      hasPermission({
        role: "PLATFORM_ADMIN",
        userOrganizationId: "org-1",
        resourceOrganizationId: "org-2"
      })
    ).toBe(true);
  });
});