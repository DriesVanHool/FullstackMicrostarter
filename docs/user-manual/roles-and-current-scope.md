# Roles and current scope

The public starter now uses a deliberately small role model.

## Current platform role vocabulary

The shared client and backend examples currently use these role names:

- `ADMIN`
- `USER`

These are expected to be configured as **Keycloak realm roles**.

## What those roles mean today

### Users

`USER` is the default non-admin role for people using the product.

Planned direction can include things like:

- accessing product features
- completing assigned flows
- viewing their own progress or results
- working inside the workspace surface intended for regular users

### Admins

`ADMIN` covers platform and management workflows.

Planned direction can include things like:

- managing users and access
- configuring platform structure or content
- overseeing operational workflows
- handling administrative setup tasks

## What is actually available today

In the current codebase, role behavior is still partial.

### Backend

The clearest implemented role behavior today is in backend authorization examples.

For example, `UserService` demonstrates patterns such as:

- **admin** users accessing administrative user flows
- **regular users** being limited to their own user context in narrower flows

### Frontend

The frontend has reusable role-aware building blocks, but most role-specific product journeys are still early.

That means the frontend currently supports:

- signed-in route protection
- role-aware route guards
- role-aware navigation visibility
- role-aware profile menu visibility

But it does **not** yet mean every role has a rich finished app experience.

One concrete admin workflow is now available in the Portal:

- admins can open the users page
- search existing users
- create a new user with first name, last name, email, and one or more initial roles
- rely on the backend + Keycloak flow to send the new user a verification and password setup email

## What testers should expect

If you are evaluating the current repo:

- expect reusable client-side role infrastructure
- expect backend authorization examples
- do not expect every end-user and admin workflow to be fully built out yet
- treat role coverage as real but still incomplete in terms of finished product surface
