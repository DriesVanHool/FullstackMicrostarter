# UI package

The `@fullstackmicrostarter/ui` package contains reusable frontend presentation components and theme infrastructure shared across client apps.

## Goals

The package should contain:

- reusable presentation components
- app-agnostic page shell building blocks
- theme and design-system wiring

It should **not** contain app-specific business workflows.

## Current exported components

### `ApplicationCard`

Use for launcher-style app cards that link into another hosted app.

Current responsibilities:

- badge label
- title
- description
- primary CTA button

Typical use case:

- portal app launcher surfaces

### `PageIntroCard`

Use for page-level introduction blocks with:

- a badge/chip
- page title
- descriptive supporting text

Typical use case:

- admin landing pages
- workspace overview pages
- section placeholder pages

### `NavigationCard`

Use for titled support sections with:

- optional icon
- title
- description
- optional actions
- optional extra content via children

Typical use case:

- “next step” panels
- supporting dashboard sections
- admin or management follow-up sections

### `AppLoadingScreen`

Use while client auth or initial app bootstrapping is resolving.

### `SignInScreen`

Shared sign-in presentation shell for apps that authenticate through Keycloak.

### `FormDialog`

Use for reusable dialog-based forms that need a consistent title, supporting copy, content area, and submit/cancel actions.

Typical use case:

- admin create/edit flows
- small to medium modal forms shared across apps

## Theme exports

The package also exports:

- `AppThemeProvider`
- `useThemeMode`
- `lightTheme`
- `darkTheme`

These provide the shared MUI theme, dark/light mode handling, and common component styling.

## Usage guidance

### Good candidates for `@fullstackmicrostarter/ui`

Move a component into the UI package when it is:

- presentation-focused
- reusable across multiple apps or pages
- not tied to one business workflow
- valuable for keeping spacing, surface styling, and actions consistent

### Bad candidates for `@fullstackmicrostarter/ui`

Do **not** move components here when they are:

- tightly coupled to one app’s domain model
- coupled to backend APIs or page-specific data loading
- primarily authorization logic instead of presentation
- so narrow that they only wrap a single button or one specific CTA phrase

Those belong in app code or another shared package such as `auth`, `layout`, or `api-client`.

## Current extraction examples

The shared UI package is now used across both portal and workspace page shells, including:
