# Production deployment

This repository is not production-packaged yet, but the current code already implies a deployment shape.

## Current deployment units

Plan to deploy these as separate runtime units:

- frontend applications built from the `client/` workspace
- `GatewayService` as the public API entry point
- `UserService` as an internal service
- Keycloak as an identity dependency
- PostgreSQL as persistent storage

## Recommended deployment model

### Frontend

Build the frontend with:

```bash
cd client
npm ci
npm run build
```

Serve the generated static assets behind a web server or CDN.

### Documentation site

Build the docs with:

```bash
cd /path/to/fullstackmicrostarter
npm ci
npm run docs:build
```

Publish `docs/.vitepress/dist` as a static site if you want internal project docs available in an environment.

### Backend services

Because backend services can depend on shared code in `api/Common`, prefer packaging from the `api/` root:

```bash
cd api
../mvnw clean package
```

That builds the shared module and the service JARs together in one reactor build.

If you package a single service directly, make sure the shared `Common` module is already built and available to Maven.

## Production concerns to address before calling the stack ready

### 1. Replace local-default configuration assumptions

The current defaults are developer friendly, not production safe.

Examples:

- localhost hostnames
- inline default database credentials
- JPA `ddl-auto=update`
- missing formal secrets handling

### 2. Introduce real database migrations

The service docs and agent rules expect a migration-based approach, but the current code still relies on Hibernate schema updates. Production deployment should switch to Flyway or Liquibase before the data model becomes important.

### 3. Harden identity integration

Before production, confirm:

- realm configuration is versioned or exported
- SPA client redirect URIs and web origins are tightly scoped
- Authorization Code flow with PKCE is preserved for the frontend client
- token lifetimes and logout behavior match operational requirements
- role mapping is stable and documented
- password setup and recovery remain Keycloak-native, including required-action email delivery and the hosted forgot-password flow

For hosted environments such as Hetzner + Coolify, that means the external Keycloak base URL, redirect URIs, post-logout redirect URIs, and email delivery settings all need to be correct before you consider login recovery production-ready.

### 4. Add observability

The current services expose basic Spring Boot structure, but production deployments should also include:

- health checks wired to orchestration
- service-separated log shipping or collection from `logs/gateway-service/` and `logs/user-service/`
- metrics and tracing where available
- alerting for auth and routing failures

### 5. Clarify network boundaries

A sensible production shape would be:

- public access to frontend and gateway only
- private networking for UserService
- controlled access from backend services to Keycloak and PostgreSQL

## Suggested release checklist

Before a production release, verify at minimum:

- frontend builds successfully
- docs build successfully
- each backend service passes tests and packages cleanly
- environment variables are documented and provided securely
- Keycloak realm/client configuration is reproducible
- database migration strategy is in place
- the deployment topology matches the gateway routing assumptions

## Honest status

Right now, this page is best read as a deployment readiness guide rather than a statement that the repo is already production ready.

## Hosted Keycloak email and password recovery

If you deploy on Hetzner with Coolify, treat Keycloak email delivery and reset UX as part of the identity deployment, not as part of the starter apps.

### Minimum production identity checklist

- expose Keycloak on its real external HTTPS URL, for example `https://auth.example.com`
- set the realm frontend URL and hostname settings so links in emails point at the public Keycloak URL, not an internal Docker hostname or private Coolify service name
- configure a real SMTP provider for Keycloak email delivery
- verify the public SPA client uses tightly-scoped redirect URIs and post-logout redirect URIs for the actual frontend hosts only
- keep the SPA client public and PKCE-based; do not add a client secret to browser apps
- keep the backend admin client confidential and server-side only
- make sure required-action emails and forgot-password emails both work before calling the environment operational

### SMTP guidance for Hetzner and Coolify

A typical Coolify deployment shape is:

- frontend app: `https://app.example.com`
- Keycloak: `https://auth.example.com`
- gateway/api: `https://api.example.com`

For Keycloak email delivery, configure Keycloak with a real SMTP service such as Mailgun, Postmark, SES, or your transactional SMTP provider. Do not point production Keycloak at Mailpit, and do not rely on localhost SMTP assumptions.

At minimum, verify in Keycloak:

- SMTP host, port, username, password, and encryption mode match the provider
- sender address is domain-aligned and acceptable for SPF/DKIM/DMARC
- test email succeeds from the Keycloak admin console
- required-action emails and forgot-password emails both contain public HTTPS links to the hosted Keycloak realm

### Redirect, logout, and web-origin scoping

For the public SPA client, explicitly list only the real frontend URLs you serve. For example:

- valid redirect URI: `https://app.example.com/*`
- valid post logout redirect URI: `https://app.example.com/*`
- web origin: `https://app.example.com`

If you host multiple frontends, add only those exact hosts. Avoid broad wildcards that cover unrelated domains or preview hosts unless you intentionally need them and have reviewed the risk.

### Security model for password reset

The starter platform does not mint or validate password-reset tokens itself.

- reset links generated by Keycloak use Keycloak-managed action tokens
- required-action links for initial password setup are also Keycloak-managed
- Frontend code should only link users into hosted Keycloak flows
- Backend services should not implement parallel reset-token storage or verification unless the identity design is intentionally changed

That separation matters operationally and security-wise: email delivery, token validity, link generation, and the hosted reset UI all belong to Keycloak.
