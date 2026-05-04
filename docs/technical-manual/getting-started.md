# Getting started

## What you are starting from

This repository currently includes:

- a frontend app workspace in `client`
- backend services in `api`
- a VitePress documentation site in `docs`

The backend already demonstrates the service split and security model. The frontend uses a shared-package structure so authentication, layout, API access, and role-aware UI behavior can be reused across multiple apps.

## Prerequisites

Install these first:

- Node.js 20+
- npm 10+
- Java 21
- Docker
- Docker Compose plugin (`docker compose`)

If you do not want to use Docker, you can run PostgreSQL and Keycloak manually, but Docker is the easiest local path.

## Quick start checklist

1. Start PostgreSQL, Mailpit, and Keycloak
2. Create the expected Keycloak realm, roles, clients, and local SMTP settings
3. Start the backend services
4. Start the frontend
5. Start the docs site when you need local reference material

## Fastest local dependency setup

### PostgreSQL via Docker

```bash
docker run --name fullstackmicrostarter-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=sql \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -d postgres:16
```

### Keycloak via Docker

```bash
docker run --name fullstackmicrostarter-keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -p 9090:8080 \
  -d quay.io/keycloak/keycloak:25.0 \
  start-dev
```

After that:

- open `http://localhost:9090`
- log in with `admin / admin`
- create realm `starter-dev`
- create the public SPA client expected by the frontend
- create the confidential backend admin client expected by `UserService`

More detail, including local Mailpit-backed email testing, lives in `docs/technical-manual/local-setup.md`.

## Start commands

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend apps expect app-local `.env.local` files based on the checked-in examples:

- `client/apps/portal/.env.example`
- `client/apps/workspace/.env.example`

Important frontend values include:

- `VITE_API_BASE_URL`
- `VITE_KEYCLOAK_URL`
- `VITE_KEYCLOAK_REALM`
- `VITE_KEYCLOAK_CLIENT_ID`
- `VITE_WORKSPACE_URL`
- `VITE_PORTAL_URL`

### Docs

```bash
cd /path/to/fullstackmicrostarter
npm install
npm run docs:dev
```

### Backend modules and services

Because backend code can now be shared through `api/Common`, prefer building and testing from the `api/` root when shared backend infrastructure changes.

Build all backend modules:

```bash
cd api
../mvnw clean test
```

Run individual services during development:

#### Gateway service

```bash
cd api/GatewayService
../mvnw spring-boot:run
```

#### User service

```bash
cd api/UserService
../mvnw spring-boot:run
```

## Default ports

- portal frontend: `5173`
- workspace frontend: `5174`
- docs: `4173`
- gateway: `8080`
- user service: `8081`
- Keycloak: `9090`
- PostgreSQL: `5432`

## Role model and client-side authorization

The shared client auth package currently defines these platform roles:

- `ADMIN`
- `USER`

These role names are expected to come from **Keycloak realm roles**.

### Where client roles come from

The frontend does not invent roles on its own.

1. Keycloak issues a token after login
2. `AuthProvider` reads the token claims from Keycloak
3. the authenticated user is built from token claims
4. `user.roles` is populated from `realm_access.roles`

That means the client-side role system depends on Keycloak issuing tokens that actually include the expected realm roles.

### Shared auth and role-aware building blocks

The frontend role-aware setup is intentionally split into reusable package primitives.

#### `client/packages/auth`

- `AuthProvider`
  - initializes Keycloak
  - stores signed-in state
  - exposes the authenticated user
- `ProtectedRoutes`
  - protects signed-in route trees
- `PublicRoutes`
  - protects signed-out route trees
- `AuthRole`
  - shared role constants
- `hasRole` / `hasAnyRole`
  - shared role helpers
- `useAuthorizedItems`
  - shared role-aware item filtering
- `RoleGuard`
  - reusable role-based rendering guard
- `RoleRoutes`
  - reusable route-group protection

#### `client/packages/layout`

- `NavigationItem.requiredRoles`
  - hides navigation entries when the current user is missing the required role
- `RoleMenuItem.requiredRoles`
  - hides profile menu entries when the current user is missing the required role
- `WorkspaceLayout`
  - provides the product workspace shell
- `PortalLayout`
  - provides the launcher-style portal shell

## How to use roles in client apps

### 1. Hide navigation for unauthorized users

```ts
const navigationItems: NavigationItem[] = [
  {
    label: 'Admin',
    description: 'Protected admin area',
    path: '/admin',
    requiredRoles: [AuthRole.ADMIN],
  },
]
```

If the current user does not have `ADMIN`, that item will not appear in the shared layout.

### 2. Protect a route or subtree

```tsx
<Route
  path="/admin"
  element={
    <RoleGuard roles={[AuthRole.ADMIN]}>
      <AdminPage />
    </RoleGuard>
  }
/>
```

Use `RoleGuard` when page visibility depends on roles instead of just sign-in state.

### 3. Protect an entire route group

```tsx
<Route element={<ProtectedRoutes loadingElement={<AppLoadingScreen />} />}>
  <Route element={<WorkspaceLayout appName="Product Workspace" appSubtitle="Focused product workspace" navigationItems={navigationItems} />}>
    <Route path="/" element={<DashboardPage />} />
    <Route
      path="/users"
      element={
        <RoleGuard roles={[AuthRole.ADMIN]}>
          <UsersPage />
        </RoleGuard>
      }
    />
  </Route>
</Route>
```

This is the intended pattern for app code:

- `ProtectedRoutes` handles authentication
- `RoleGuard` handles authorization-sensitive UI sections
- `requiredRoles` keeps navigation consistent with route restrictions

## Important boundary: client checks vs backend enforcement

Client-side role guards are useful for:

- hiding navigation that should not appear for a user
- preventing users from entering pages that do not apply to their role
- keeping app shells and menus consistent with current permissions

They are **not** a replacement for backend authorization.

Protected backend endpoints must still enforce roles server-side.

The backend is the real security boundary. The frontend role-aware layer is primarily a UX and consistency layer.

## First places to inspect

If you are new to the repo, start here:

- `AGENTS.md`
- `api/AGENTS.md`
- `client/AGENTS.md`
- `README.md`
- `docs/technical-manual/architecture.md`
- `docs/technical-manual/local-setup.md`
