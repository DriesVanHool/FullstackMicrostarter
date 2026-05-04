# Fullstack Microstarter Frontend Workspace

## Workspace layout

```text
client/
├── apps/
│   ├── portal/
│   └── workspace/
└── packages/
    ├── auth/
    ├── layout/
    └── ui/
```

## Run locally

```bash
npm install
npm run dev:portal
npm run dev:workspace
```

Default URLs:

- `portal`: <http://localhost:5173>
- `workspace`: <http://localhost:5174>

## Quality checks

```bash
npm run lint
npm run build
```

## Shared packages

- `@fullstackmicrostarter/auth` holds the shared Keycloak auth provider, role helpers, and route guards
- `@fullstackmicrostarter/ui` holds the shared theme, Keycloak-aware sign-in shell, and reusable UI building blocks
- `@fullstackmicrostarter/layout` holds the shared authenticated navigation, product-app shell, and portal-specific launcher layout
- `@fullstackmicrostarter/api-client` holds the shared TanStack Query + Axios API client package
