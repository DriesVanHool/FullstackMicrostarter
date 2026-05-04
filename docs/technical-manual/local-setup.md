# Local setup

This page documents the local setup expected by the current codebase.

## Services in the repo

### GatewayService

- port: `8080`
- role: edge routing and JWT validation
- configured routes:
  - `/api/users/**` -> `UserService`
  - `/api/admin/users/**` -> `UserService`

### UserService

- port: `8081`
- uses PostgreSQL
- validates JWTs from Keycloak
- currently exposes protected user and admin-user flows

## Backend log files

Each backend service writes text logs to its own directory under `logs/` by default:

- `logs/gateway-service/`
- `logs/user-service/`

The active file is `application.log`. Archived files rotate daily and also rotate within a day if the current file crosses the configured size threshold.

Optional overrides:

- `LOG_ROOT` for the base log directory
- `LOG_MAX_FILE_SIZE` for the per-file size limit before rolling
- `LOG_MAX_HISTORY` for the number of retained days
- `LOG_TOTAL_SIZE_CAP` for the maximum retained archive size per service

## Primary local dependency path

The repository includes a `docker-compose.yml` file for local PostgreSQL, Mailpit, and Keycloak setup.

For local development, use:

```bash
docker compose up -d
```

To stop it:

```bash
docker compose down
```

To stop it and remove persisted database data:

```bash
docker compose down -v
```

To inspect logs:

```bash
docker compose logs -f postgres
docker compose logs -f keycloak
docker compose logs -f mailpit
```

## Important note about port 5432

The compose setup binds PostgreSQL to host port `5432`.

If you already run PostgreSQL locally on your machine, Docker will fail to start the `postgres` container with an address-already-in-use error.

Check with:

```bash
sudo ss -ltnp | grep 5432
```

If local PostgreSQL is using the port, stop it before starting the compose stack.

## What Compose starts

### PostgreSQL

The local PostgreSQL container uses these defaults:

- username: `admin`
- password: `sql`
- database: `postgres`
- host port: `5432`

The setup creates these schemas:

- `user_db`
- `keycloak_db`

The Spring services use the application schema directly through their JDBC URLs.

### Mailpit

Mailpit runs on:

- SMTP: `localhost:1025`
- web inbox: `http://localhost:8025`

Use it for local-only email testing. It accepts SMTP mail without TLS or authentication and exposes captured messages in the browser UI. That is fine for local development and not acceptable for production.

### Keycloak

Keycloak runs on:

- `http://localhost:9090`

The local compose setup mounts the repo-owned Keycloak themes directory from `keycloak/themes` into the container so login theme changes can be developed locally without rebuilding the image.

The repo currently includes a custom `fullstackmicrostarter` Keycloak login theme under `keycloak/themes/fullstackmicrostarter`.

Basic email template customization uses that same repo-owned theme:

- edit the relevant FreeMarker templates under `keycloak/themes/fullstackmicrostarter/email/` if the theme includes an email variant, or add an `email/` theme directory there when you want repo-owned overrides
- update the matching message bundle entries in `messages/messages_en.properties` for subject lines and visible text
- keep the changes simple: wording, labels, support copy, and light branding are the intended level here
- after editing, select the same theme in Keycloak and trigger a test reset/setup email to verify the rendered result

Default admin login from compose:

- username: `admin`
- password: `admin`

Default repo assumptions:

- realm: `starter-dev`
- frontend SPA client ID: `starter-client`
- backend admin client ID: `backend-client`
- issuer URI: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}` unless overridden

The backend expects JWTs containing Keycloak `realm_access.roles` data.

## Keycloak clients used by this repo

This repo uses two different kinds of Keycloak clients.

### 1. Frontend SPA client

This is the browser-facing client used by the portal and workspace frontend apps.

- client ID: `starter-client`
- client type: public SPA client
- auth flow: Authorization Code + PKCE
- used by: browser frontend

This client should not have a client secret.

### 2. Backend admin client

This is the confidential client used by `UserService` when it needs to create users, assign roles, and trigger required actions in Keycloak.

- client ID: `backend-client`
- client type: confidential client
- auth flow: client credentials
- used by: backend only

This client must have:

- client authentication: on
- service accounts: on
- a generated client secret
- enough realm-management permissions to create users, assign roles, and trigger required actions

The backend admin client is separate from the SPA client on purpose:

- the frontend signs users in directly with PKCE
- the backend uses a confidential machine-to-machine client for administrative identity operations
- user creation should not depend on exposing privileged Keycloak capabilities to the browser

## Role setup for local development

The shared client auth and layout packages currently assume these realm roles exist:

- `ADMIN`
- `USER`

These are the role names used by:

- frontend client-side role guards
- role-aware navigation filtering
- role-aware profile menu filtering
- backend role-based authorization examples

### Minimum role setup flow

After Keycloak is running:

1. Open `http://localhost:9090`
2. Log in with `admin / admin`
3. Create realm `starter-dev`
4. Create these realm roles:
   - `ADMIN`
   - `USER`
5. Create the frontend SPA client
   - client ID: `starter-client`
   - client authentication: off
   - standard flow: on
   - direct access grants: off
   - service accounts: off
   - valid redirect URI: `http://localhost:5173/*`
   - valid redirect URI: `http://localhost:5174/*`
   - valid post logout redirect URI: `http://localhost:5173/*`
   - valid post logout redirect URI: `http://localhost:5174/*`
   - web origin: `http://localhost:5173`
   - web origin: `http://localhost:5174`
6. Ensure PKCE is enabled with method `S256`
7. Create the backend admin client
   - client ID: `backend-client`
   - client authentication: on
   - standard flow: off
   - direct access grants: off
   - service accounts: on
   - copy the generated client secret for `KEYCLOAK_CLIENT_SECRET`
8. Grant the backend client the realm-management roles it needs for user administration
   - go to `Clients` -> `backend-client` -> `Service account roles`
   - assign roles from the `realm-management` client
   - for the current user creation flow, start with:
     - `manage-users`
     - `view-users`
     - `query-users`
     - `view-realm`
   - if role assignment still fails, add the realm-management role required for role mapping in your Keycloak version/UI as well
9. Create test users with distinct role combinations
   - for example one `ADMIN` user and one `USER` user
   - set non-temporary passwords
   - ensure no required actions block login
10. Ensure issued tokens include the assigned realm roles under `realm_access.roles`
11. If you want the hosted Keycloak login page to match the current light sign-in styling, go to Realm Settings -> Themes and set `Login Theme` to `fullstackmicrostarter`
12. Enable `Forgot password` in the realm login settings so the hosted Keycloak recovery flow is available
13. Configure realm email for local Mailpit delivery
   - go to Realm Settings -> Email
   - set `Host` to `mailpit` if you are configuring from inside the compose network-aware Keycloak container, or `localhost` only when your Keycloak instance is running outside Docker
   - set `Port` to `1025`
   - leave `Encryption` disabled for local Mailpit
   - leave authentication disabled unless you intentionally added SMTP auth to your local Mailpit setup
   - set a sensible sender such as `no-reply@starter.local`
   - save and use `Test connection` or `Send test email` from the Keycloak admin console
14. Verify the hosted forgot-password flow end to end
   - open the starter login page and click the password-reset link, or open the Keycloak login page directly
   - confirm Keycloak shows the hosted reset screen rather than an app-side reset form
   - submit the test user email address
   - open `http://localhost:8025` and confirm the message arrives in Mailpit
   - use the email link and finish the reset on the hosted Keycloak pages
   - sign in again through the app with the new password
15. Treat password setup and reset as Keycloak-owned flows
   - new users finish setup from the required-action email triggered by the backend admin client
   - existing users recover access through the hosted Keycloak reset flow
   - reset links and reset tokens are Keycloak-managed action tokens, not app tokens
16. If you want to test protected API calls manually in Postman with the same PKCE-style user flow
   - use OAuth 2.0 with `Authorization Code (With PKCE)`
   - auth URL: `http://localhost:9090/realms/starter-dev/protocol/openid-connect/auth`
   - access token URL: `http://localhost:9090/realms/starter-dev/protocol/openid-connect/token`
   - client ID: `starter-client`
   - redirect URI: `https://oauth.pstmn.io/v1/callback`
   - code challenge method: `S256`
   - scope: `openid profile email`
   - add `https://oauth.pstmn.io/v1/callback` to the Keycloak client's valid redirect URIs before testing, otherwise Keycloak rejects the redirect URI
   - after Postman gets the token, click `Use Token` and call the gateway endpoint you want to test
   - do not add a separate local reset form unless the security model is intentionally changed

## How the frontend consumes roles

The frontend role-aware flow is:

1. Keycloak signs the user in
2. `AuthProvider` reads token claims from Keycloak
3. the client user object is built from those claims
4. `user.roles` is populated from `realm_access.roles`
5. shared helpers and guards use those roles for visibility checks

That means if role-aware UI behavior is wrong, the first thing to verify is whether the token actually contains the expected realm roles.

## Role-aware client features that depend on correct token roles

Current shared client infrastructure supports:

- `RoleGuard` for page or subtree visibility
- `NavigationItem.requiredRoles` for sidebar/navigation visibility
- `RoleMenuItem.requiredRoles` for profile menu visibility

If a user signs in successfully but does not see an expected page entry or menu item, the cause is usually one of:

- the user was not assigned the expected realm role in Keycloak
- the token does not include the role under `realm_access.roles`
- the app used the wrong role name or casing in `requiredRoles`
- the route is guarded in client code but the test user does not have the matching role

## Environment variables

The current services support these environment variables in practice.

### Shared database variables

- `POSTGRES_DB_HOST`
- `POSTGRES_DB_PORT`
- `POSTGRES_DB_USERNAME`
- `POSTGRES_DB_PASSWORD`

### Shared Keycloak variables

- `KEYCLOAK_BASE_URL`
- `KEYCLOAK_REALM`
- `KEYCLOAK_ISSUER_URI`

Keycloak SMTP settings for reset/setup email delivery are configured in the Keycloak admin console or by your deployment platform, not through frontend code. Keep that distinction clear: the app triggers no reset-token generation of its own.

### Backend admin-client variables

- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`

### Frontend Vite variables

- `apps/workspace/.env.local`: `VITE_API_BASE_URL`
- `apps/workspace/.env.local`: `VITE_PORTAL_URL`
- `apps/portal/.env.local`: `VITE_WORKSPACE_URL`
- `VITE_KEYCLOAK_URL`
- `VITE_KEYCLOAK_REALM`
- `VITE_KEYCLOAK_CLIENT_ID`

### Gateway route targets

- `USER_SERVICE_HOST`
- `USER_SERVICE_PORT`

### Gateway CORS variables

The gateway CORS setup reads from startup environment variables. Local development falls back to the portal and workspace localhost origins if you do not override them.

- `APP_CORS_ALLOWED_ORIGINS` (comma-separated, default: `http://localhost:5173,http://localhost:5174`)
- `APP_CORS_ALLOWED_METHODS` (comma-separated, default includes `GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD`)
- `APP_CORS_ALLOWED_HEADERS` (comma-separated)
- `APP_CORS_EXPOSED_HEADERS` (comma-separated)
- `APP_CORS_ALLOW_CREDENTIALS` (default: `true`)

If `APP_CORS_ALLOW_CREDENTIALS=true`, do not use `*` in `APP_CORS_ALLOWED_ORIGINS`; the gateway will fail fast at startup because credentialed CORS requires explicit origins.

## Practical local workflow

1. Start dependencies with `docker compose up -d`
2. Wait until PostgreSQL and Keycloak are ready
3. Create the `starter-dev` realm or override the realm env var
4. Create the public SPA client used by the frontend
5. Create the confidential backend admin client used by `UserService`
6. Create realm roles and assign them to test users
7. Start `UserService`
8. Start `GatewayService`
9. Copy `client/apps/portal/.env.example` to `client/apps/portal/.env.local`
10. Copy `client/apps/workspace/.env.example` to `client/apps/workspace/.env.local`
11. Start the frontend apps and sign in through Keycloak
12. If you want to test shared theme persistence locally across app-like subdomains, use local hostnames such as `portal.lvh.me` and `workspace.lvh.me`, and set `VITE_COOKIE_DOMAIN=.lvh.me`
13. Call the gateway rather than calling internal services directly when testing routed API behavior
14. When testing role-aware UI behavior, verify both allowed and hidden states using users with different assigned roles
15. When testing password recovery locally, verify both Mailpit inbox delivery and the full hosted Keycloak reset completion path

## Role troubleshooting checklist

If role-aware UI behavior is not working as expected, check these in order:

1. **Realm roles exist**
   - confirm `ADMIN` and `USER` exist in the correct realm
2. **User assignments are correct**
   - confirm the signed-in user actually has the expected role assignment
3. **Token contents are correct**
   - inspect the token and verify `realm_access.roles` contains the expected role names
4. **Frontend config is correct**
   - confirm the app is using the expected realm and client ID
5. **Client declarations are correct**
   - confirm `requiredRoles` or `RoleGuard` uses the expected role names
6. **Backend enforcement still exists**
   - remember that client-side role visibility is not the security boundary

## What is still missing today

- no checked-in Keycloak realm export
- no bootstrap SQL or migration set for a full local seed
- role-aware client infrastructure exists, but many role-specific workflows are still scaffold-level rather than complete product flows

So dependency startup is easier now, but application-level setup still needs a few manual steps.
