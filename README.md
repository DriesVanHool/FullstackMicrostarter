# Fullstack Microstarter

Fullstack Microstarter is a production-minded starter repository for teams that want a real full-stack foundation instead of a throwaway demo.

It gives you a modular Java backend, a multi-app React workspace, shared frontend packages, Keycloak-based authentication, and VitePress documentation in one repo. The goal is to help you start from sensible boundaries and extend toward your own product without first undoing a toy architecture.

## What you get

- **Gateway-first backend architecture** with separate Spring Boot services
- **Multi-app frontend workspace** with portal and product-workspace entry points
- **Shared frontend packages** for auth, layout, UI, and API access
- **Keycloak integration** using Authorization Code + PKCE for browser sign-in
- **Role-aware UI primitives** paired with backend-enforced authorization
- **Built-in docs site** for technical and user-facing documentation
- **Local development stack** via Docker Compose for PostgreSQL, Keycloak, and Mailpit

## Repository layout

```text
.
├── api/
│   ├── Common/              # Shared backend infrastructure
│   ├── GatewayService/      # API gateway and JWT validation
│   └── UserService/         # User and admin-user flows
├── client/
│   ├── apps/
│   │   ├── portal/          # Launcher/admin-facing app
│   │   └── workspace/       # Product workspace app
│   └── packages/
│       ├── api-client/      # Shared API client and query helpers
│       ├── auth/            # Keycloak auth provider, guards, role helpers
│       ├── layout/          # Shared app shells and navigation
│       └── ui/              # Shared design system and reusable components
├── docs/                    # VitePress documentation site
├── keycloak/                # Repo-owned Keycloak theme assets
├── docker-compose.yml       # Local infra for PostgreSQL, Keycloak, Mailpit
└── README.md
```

## Architecture at a glance

### Backend

The backend is split into focused Spring Boot modules under `api/`.

- **GatewayService** is the routed entry point for frontend API traffic.
- **UserService** contains the strongest current examples of protected user and admin-user flows.
- **Common** holds shared code used across services.

This is meant to feel like an actual service-oriented codebase, not a single monolith pretending to be modular.

### Frontend

The frontend is intentionally divided into **apps** and **shared packages**.

- `client/apps/portal` is the launcher/admin-facing surface.
- `client/apps/workspace` is the product workspace shell.
- `client/packages/*` keeps auth, layout, UI, and API plumbing reusable so app-level code can stay thin and declarative.

### Authentication and authorization

The starter uses **Keycloak** as the identity provider.

- Browser apps sign users in with **OpenID Connect Authorization Code flow + PKCE**.
- Backend services validate JWTs and enforce access server-side.
- Shared client packages handle route protection, role-aware navigation, and authenticated app state.
- Administrative identity operations use a separate confidential backend client.
- Password setup and password recovery remain Keycloak-native flows.

## Who this starter is for

This repository is a good fit if you want to start from:

- a Java + React stack with clear separation of concerns
- role-aware frontend behavior without pushing security into the browser
- externalized identity through Keycloak
- a codebase that is already split into reusable frontend and backend layers

This repository is **not** a finished product. It is a starter with working structure, real integration points, and honest scaffolding where product-specific behavior still needs to be built.

## Quick start

### Prerequisites

Install these first:

- Node.js 20+
- npm 10+
- Java 21
- Docker with the Compose plugin

### 1. Start local infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL, Keycloak, and Mailpit using the checked-in local setup.

### 2. Configure local frontend environment files

```bash
cp client/apps/portal/.env.example client/apps/portal/.env.local
cp client/apps/workspace/.env.example client/apps/workspace/.env.local
```

Then adjust the values if your local Keycloak or API hosts differ from the defaults.

### 3. Start the frontend apps

```bash
cd client
npm install
npm run dev
```

Default local URLs:

- Portal: <http://localhost:5173>
- Workspace: <http://localhost:5174>

### 4. Build and test the backend

```bash
cd api
../mvnw clean test
```

### 5. Run backend services during development

```bash
cd api/GatewayService
../mvnw spring-boot:run
```

```bash
cd api/UserService
../mvnw spring-boot:run
```

### 6. Run the docs site locally

```bash
npm install
npm run docs:dev
```

The docs site runs at <http://localhost:4173> by default.

## Common commands

### Frontend

From `client/`:

```bash
npm run lint
npm run test
npm run build
```

### Backend

From `api/`:

```bash
../mvnw clean test
```

### Docs

From the repository root:

```bash
npm run docs:build
```

## Local auth model

The checked-in docs assume a local Keycloak realm named `starter-dev` with:

- a **public SPA client** for the frontend
- a **confidential backend client** for administrative identity operations
- realm roles such as `ADMIN` and `USER`

See the local setup documentation for the exact Keycloak configuration steps, including Mailpit-backed email testing and hosted password recovery flows.

## Documentation map

- [Docs home](./docs/)
- [Technical manual](./docs/technical-manual/)
- [Getting started](./docs/technical-manual/getting-started)
- [Local setup](./docs/technical-manual/local-setup)
- [Architecture](./docs/technical-manual/architecture)
- [Production deployment notes](./docs/technical-manual/production-deployment)
- [User manual](./docs/user-manual/)

## Current maturity

What is already in place:

- clear frontend/backend separation
- shared auth, layout, UI, and API-client packages
- gateway and service boundaries
- Keycloak integration patterns
- local infrastructure and documentation for development

What you should still expect to tailor or build out:

- domain-specific workflows
- richer product features
- data migrations and seed strategy
- production deployment specifics
- repo-specific CI/CD and release automation

In other words: the foundation is real, but the product is still yours to shape.

## License

This project is released under the [MIT License](./LICENSE).
