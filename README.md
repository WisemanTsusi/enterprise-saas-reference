# 🏢 Enterprise SaaS Reference Platform

> A production-oriented reference implementation demonstrating **multi-tenancy, organization/workspace hierarchies, RBAC/ABAC authorization, subscription billing, auditability and platform administration** using Node.js, TypeScript, PostgreSQL and Prisma.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square\&logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square\&logo=prisma\&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square\&logo=docker\&logoColor=white)](https://www.docker.com/)

---

## 🎯 Purpose

This project demonstrates how an enterprise SaaS platform can model and enforce:

```text
Platform
   │
   ├── Organization
   │      │
   │      ├── Workspace
   │      │      │
   │      │      ├── Department
   │      │      ├── Branch
   │      │      └── Resources
   │      │
   │      └── Users
   │
   ├── Subscription
   ├── Billing
   ├── Policies
   └── Audit Logs
```

The implementation is intentionally generic and contains **no proprietary product source code**.

---

## 🧩 Core Capabilities

### 🏢 Multi-Tenancy

Each organization represents an isolated SaaS tenant.

Every tenant-owned resource carries an `organizationId`, allowing application services and middleware to enforce tenant boundaries.

### 🗂️ Organization & Workspace Hierarchy

```text
Organization
    │
    ├── Workspace
    │      ├── Department
    │      └── Branch
    │
    └── Users
```

A user can belong to multiple organizations and workspaces.

### 🔐 Authentication

The reference architecture supports authenticated requests through bearer tokens.

Authentication establishes:

```text
User
 ↓
Organization
 ↓
Workspace
 ↓
Request Context
```

### 🛡️ RBAC

Role-based permissions provide coarse-grained authorization.

Example:

```text
PLATFORM_ADMIN
ORGANIZATION_OWNER
ORGANIZATION_ADMIN
WORKSPACE_ADMIN
MANAGER
MEMBER
VIEWER
```

### 🧠 ABAC

Attribute-based policies provide contextual authorization.

Example:

```text
Can user.updateRecord?

user.organizationId === record.organizationId
AND
user.departmentId === record.departmentId
AND
record.status !== "LOCKED"
```

### 💳 Billing

The billing model separates:

```text
Customer
   ↓
Subscription
   ↓
Plan
   ↓
Entitlements
   ↓
Usage
   ↓
Invoices
```

### 📜 Auditability

Security-sensitive operations generate immutable audit events.

Examples:

```text
USER_CREATED
ROLE_CHANGED
ORGANIZATION_UPDATED
WORKSPACE_CREATED
SUBSCRIPTION_CHANGED
LOGIN
ACCESS_DENIED
```

### ⚙️ Platform Administration

Platform administrators can manage:

* organizations
* users
* subscriptions
* plans
* feature entitlements
* tenant status
* platform audit events

---

## 🏗️ Architecture

```text
                       ┌─────────────────────┐
                       │   Web / Mobile /    │
                       │   External Clients  │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │      REST API       │
                       └──────────┬──────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
          ┌──────────────────┐       ┌──────────────────┐
          │ Authentication   │       │ Rate Limiting   │
          └────────┬─────────┘       └──────────────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Tenant Resolver  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ RBAC / ABAC      │
          │ Policy Engine    │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Application      │
          │ Services         │
          └────────┬─────────┘
                   │
          ┌────────┴───────────┐
          ▼                    ▼
 ┌────────────────┐    ┌────────────────┐
 │ PostgreSQL     │    │ Audit Service  │
 └────────────────┘    └────────────────┘
```

---

## 🏢 Tenant Model

The platform uses logical tenant isolation:

```text
Organization
      │
      ├── Workspaces
      │
      ├── Users
      │
      ├── Departments
      │
      ├── Branches
      │
      ├── Subscription
      │
      └── Resources
```

Tenant-aware services must never access organization-owned data without a validated tenant context.

---

## 🛡️ Authorization Model

Authorization follows:

```text
Authentication
      ↓
Tenant Resolution
      ↓
RBAC
      ↓
ABAC
      ↓
Resource Access
```

Example:

```typescript
if (user.organizationId !== resource.organizationId) {
  throw new ForbiddenError("Cross-tenant access denied");
}
```

---

## 💳 Subscription Model

Example plans:

| Plan         |     Users | Workspaces | Features   |
| ------------ | --------: | ---------: | ---------- |
| Starter      |        10 |          2 | Core       |
| Professional |       100 |         20 | Advanced   |
| Enterprise   | Unlimited |  Unlimited | Enterprise |

Plans can define feature entitlements such as:

```text
ADVANCED_REPORTING
API_ACCESS
AUDIT_LOGS
SSO
CUSTOM_ROLES
AI_FEATURES
```

---

## 📜 Audit Model

Audit records contain:

```text
actor
organization
action
resource
resourceId
metadata
ipAddress
userAgent
timestamp
```

This creates an accountability trail for important platform activity.

---

## ⚙️ Platform Administration

The platform administration layer operates above tenant administration.

```text
                    Platform
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   Organizations     Plans      Platform Users
          │
          ▼
   Tenant Administration
          │
     ┌────┴────┐
     ▼         ▼
 Workspaces   Users
```

---

## 🔌 API

### Authentication

```http
POST /api/auth/login
```

### Organizations

```http
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PATCH  /api/organizations/:id
```

### Workspaces

```http
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:id
PATCH  /api/workspaces/:id
```

### Billing

```http
GET /api/billing/subscription
GET /api/billing/usage
GET /api/billing/invoices
```

### Audit

```http
GET /api/audit
```

### Administration

```http
GET /api/admin/organizations
GET /api/admin/users
GET /api/admin/audit
```

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/WisemanTsusi/enterprise-saas-reference.git
cd enterprise-saas-reference
```

### 2. Install

```bash
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

### 4. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 5. Run migrations

```bash
npx prisma migrate dev
```

### 6. Start development server

```bash
npm run dev
```

API:

```text
http://localhost:3000
```

---

## 🧪 Testing

Run:

```bash
npm test
```

The test suite demonstrates:

* tenant isolation
* RBAC authorization
* ABAC authorization
* billing entitlement checks
* access denial
* audit creation

---

## 🐳 Docker

Build:

```bash
docker build -t enterprise-saas-reference .
```

Run:

```bash
docker compose up
```

---

## ☁️ Cloud Architecture

The application can be deployed to:

### AWS

```text
CloudFront
    ↓
API Gateway
    ↓
ECS / Fargate
    ↓
RDS PostgreSQL
```

### Azure

```text
Front Door
    ↓
API Management
    ↓
Container Apps
    ↓
Azure Database for PostgreSQL
```

### GCP

```text
Cloud Load Balancing
    ↓
Cloud Run
    ↓
Cloud SQL PostgreSQL
```

---

## 🔒 Security Considerations

Production deployments should additionally implement:

* OAuth 2.0 / OpenID Connect
* MFA
* SSO
* secrets management
* encryption at rest
* encryption in transit
* rate limiting
* WAF
* centralized logging
* security monitoring
* database backups
* disaster recovery
* automated dependency scanning

---

## 🧭 Roadmap

* [x] Multi-tenant domain model
* [x] Organization hierarchy
* [x] Workspace hierarchy
* [x] RBAC
* [x] ABAC policy engine
* [x] Subscription model
* [x] Audit logging
* [x] Platform administration
* [ ] OAuth/OIDC
* [ ] SSO
* [ ] MFA
* [ ] Usage metering
* [ ] Payment provider integration
* [ ] Event bus
* [ ] Background jobs
* [ ] OpenTelemetry
* [ ] Terraform
* [ ] Kubernetes deployment
* [ ] AWS reference deployment
* [ ] Azure reference deployment
* [ ] GCP reference deployment

---

## 📚 Learning Objectives

This project demonstrates practical understanding of:

**Software Architecture → SaaS → Multi-Tenancy → Security → Authorization → Billing → Auditability → Cloud**

---

## ⚠️ Disclaimer

This repository is an educational and professional reference implementation.

It is intentionally designed as a **generic SaaS architecture demonstration** and does not contain proprietary source code belonging to Ceribro™, Genius Geeks or any other commercial platform.

---

## 📄 License

MIT
