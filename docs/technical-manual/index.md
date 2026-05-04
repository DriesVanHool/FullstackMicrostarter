# Technical manual

This manual documents the repository as it exists today.

It intentionally distinguishes between:

- what is already implemented
- what is scaffolded but still thin
- what is part of the architectural direction but not yet complete

## Current implementation snapshot

- `client` now includes provider-based Keycloak authentication, login screens, and authenticated app shells for Portal and the workspace
- shared client packages now provide reusable role primitives through `AuthRole`, role helpers, and `RoleGuard`
- shared layout components now support role-aware navigation and profile menu filtering through `requiredRoles`
- `GatewayService` already routes `/api/users` and `/api/admin/users`
- Keycloak issues browser tokens directly to the frontend using Authorization Code flow with PKCE
- `UserService` already exposes protected user endpoints with role-aware access checks
- `UserService` also exposes admin-only create and update endpoints for portal user management, while keeping audit fields server-managed
- `UserService` also exposes a protected internal access-check endpoint at `/internal/users/{id}/access` for service-to-service authorization decisions using the forwarded user JWT

## Read next

- [Getting started](./getting-started)
- [Local setup](./local-setup)
- [Architecture](./architecture)
- [Production deployment](./production-deployment)
