# Known gaps and expectations

This repository is early enough that expectations matter.

## Not finished yet

At the time of writing:

- the frontend now has a real shared workspace structure, role-aware layout/auth packages, and separate Portal and the workspace shells, but many domain workflows are still scaffold-level
- there are no complete end-user product journeys in the browser
- there are no finished role-specific dashboards beyond the basic admin user-management surface
- there is no implemented admin content management UI
- there is no checked-in one-command local environment bootstrap

## What is already useful

Even in its current form, the repo is useful for:

- establishing backend service boundaries
- validating Keycloak-backed authentication patterns
- validating JWT role handling
- documenting the intended product and architecture shape
- building out features incrementally without losing the target model

## How to read the docs correctly

Use the docs as a map of:

- current implementation
- expected setup
- architectural direction

Do not read them as proof that every described product capability is already shippable.
