# 🏗️ Architecture

## Overview

The platform follows a modular monolith architecture.

```text
Client
  ↓
REST API
  ↓
Middleware
  ├── Authentication
  ├── Tenant Resolution
  ├── Authorization
  └── Audit
  ↓
Application Services
  ↓
Prisma
  ↓
PostgreSQL