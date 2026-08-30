# The permission was granted to the service not the request

`the_permission_was_granted_to_the_service_not_the_request.eml` - The reporting service holds one role. Every request it serves is authorised against that role. What the role has to be able to do is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Giving the service its own identity is correct and it is better than the two alternatives. Sharing a human's credentials makes every action untraceable and breaks when that person leaves; passing the end user's token through means the service cannot do the background work it exists for. A service account is scoped, rotatable, auditable, and it belongs to the team that runs the service.

A service account is one identity for many requests. Its permissions must be the UNION of what any request might legitimately need, because the check runs against the account and the account does not vary.

So the smallest role that lets every request succeed is one that lets every request reach everything.

```
tenants served         : 640
requests per day       : 84000
identities the service has : 1
```

```
the authorisation check
  runs on every request        : yes
  denies unauthorised access   : yes
  identity checked             : the service account
  requests denied              : 0
  failures of the check itself : 0
```

```
  the check is correct and its answer is the same every time,
  because its subject is the same every time
```

```
the role's scope, derived
  tenants any single request may need : 1
  tenants the account must reach      : 640
  reason                              : the check cannot see
    which tenant the request is for
```

```
  a request needs 1 tenant and is permitted 640
```

```
the tenant filter
  places it is applied      : 1
  enforced by the platform  : no
  enforced by a review      : yes, when the code changes
  tenants exposed if it is wrong once : 639
```

```
  the authorisation layer would permit every one of those
  reads, correctly, because it was asked about the account
```

```
what the audit log records for a cross-tenant read
  actor      : the reporting service
  action     : read
  resource   : tenant 512's rows
  authorised : yes
  on whose behalf : not recorded
```

```
  the entry is complete by its own schema, and cannot
  distinguish a legitimate report from a leak, because the
  field that would is the one the design does not carry
```

```
tenants   role must reach   a request needs   ratio
  160       160                1                 160 to 1
  320       320                1                 320 to 1
  480       480                1                 480 to 1
  640       640                1                 640 to 1
```

```
  the ratio is the tenant count, so the scope grows with
  success and never with anything a reviewer would notice
```

```
control - is the service account the right shape
  actions attributable to a person who left : 0
  credentials shared between humans          : 0
  background jobs that cannot run            : 0
  rotations blocked by a human's password    : 0
  defects in the service account             : 0
```

```
  a per-user token would break the background work this
  service exists for; the account is not the mistake
```

```
null control - the request carrying its own scope
  identities the service has : 1, unchanged
  tenants the request may reach : 1
  tenants exposed by a filter bug : 0
  audit entry names the tenant : yes, it was in the credential
  the account did not lose any permission it needs
  the permission stopped being ambient
```

```
what an authorised request establishes
  the caller was allowed to do this : yes, exactly
  this particular request was       : only if the request's
    own scope is part of what was checked
  and a service identity is by construction the union of
  every request it will ever serve
```

```
the number that describes the exposure is not the number of
roles, it is how many things one request is permitted to
touch divided by how many it needs, which here is 640 to 1
```

The service account is the right shape and beats both alternatives: 0 shared human credentials, 0 actions attributable to someone who left, 0 background jobs blocked. Because the check runs against the account, its role must reach all 640 tenants while any single request needs 1, the tenant filter exists in 1 place in application code, and an audit entry for a cross-tenant read is complete, authorised, and silent about whose request it was.

Verify it yourself:

```bash
pnpm eml run examples/the-permission-was-granted-to-the-service-not-the-request/the_permission_was_granted_to_the_service_not_the_request.eml
```
