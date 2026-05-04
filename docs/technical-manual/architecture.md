# Architecture

## Repository structure

The repository is organized around three main areas:

- `client`
  - frontend app workspace with multiple apps and shared packages
- `api`
  - backend services such as `GatewayService` and `UserService`
- `docs`
  - project documentation and technical manuals

## Frontend structure

The frontend is split into app code and shared packages.

### Client apps

Current app entry points include:

- `client/apps/portal`
- `client/apps/workspace`

Each app owns its own route definitions and app-specific pages.

### Shared client packages

Shared functionality lives in reusable packages, including:

- `client/packages/auth`
- `client/packages/layout`
- `client/packages/ui`
- `client/packages/api-client`

The goal is to keep app code declarative while shared packages handle cross-cutting concerns.

## Authentication and roles

### Identity source

The frontend signs users in directly with Keycloak using Authorization Code flow with PKCE.

`AuthProvider` initializes Keycloak and derives the authenticated user from token claims.

The current client user model reads roles from:

- `realm_access.roles`

That means role-aware client behavior depends on Keycloak realm roles being present in issued tokens.

### Shared client-side role primitives

The auth package currently provides:

- `AuthRole`
- `hasRole`
- `hasAnyRole`
- `RoleGuard`
- `ProtectedRoutes`
- `PublicRoutes`

These are intentionally generic so any client app can use the same authorization vocabulary.

### Shared role-aware layout behavior

The layout package supports:

- `NavigationItem.requiredRoles`
- `RoleMenuItem.requiredRoles`
- `WorkspaceLayout`
- `PortalLayout`

This allows app code to express role-aware navigation declaratively while keeping portal-launcher concerns separate from product-app workspace concerns.

## Authorization boundary

Client-side role checks are useful for:

- hiding irrelevant navigation
- protecting pages from casual entry
- keeping the UI aligned with current user permissions

They are not the final security boundary.

Backend services must still enforce authorization server-side.

## Backend direction

### GatewayService

The gateway acts as the routed entry point for frontend API calls and validates JWTs.

### UserService

`UserService` currently provides the clearest concrete authorization examples in the repository.

It also owns the mapping between application user IDs and Keycloak subjects, so other services should delegate user-data access checks to `UserService` through its protected internal access-check endpoint while forwarding the original bearer token.

## Current architectural direction

The repository is moving toward:

- shared client authorization primitives
- reusable layout and navigation behavior
- backend-enforced security with frontend-aligned visibility rules
- app code that declares routes, required roles, and local workflows without duplicating shared infrastructure
