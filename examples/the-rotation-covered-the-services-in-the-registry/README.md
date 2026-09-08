# The rotation covered the services in the registry

`the_rotation_covered_the_services_in_the_registry.eml` - Every service in the registry has a named on-call rotation with a tested escalation path, and no page has gone unanswered in fourteen months. Which services are in the registry is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rotation is properly run. Every entry names a person rather than a team alias that resolves to nobody at three in the morning; the escalation path is tested monthly by paging it for real; the handover is a scheduled event with a checklist rather than a calendar colour; and in fourteen months no page has gone unanswered and no escalation has run out of levels.

A service is in the rotation because it is in the registry, and it is in the registry because somebody added it. A service nobody registered does not have a gap in its coverage; it has no row.

The deployment platform is running one hundred and forty services.

```
services in the registry        : 96
  with a named rotation         : 96
  registry coverage             : 10000 per ten thousand
months without an unanswered page : 14
escalation tests last year        : 12
```

```
services running on the platform: 140
  covered by a rotation         : 96
  running without one           : 44
  share covered                 : 6857 per ten thousand
```

```
registration is a manual step   : 1
jobs that enumerate the platform: 0
alerts when a running service is unregistered : 
  0
```

```
the on-call rotation
  each entry names : a person, not a team alias that
    resolves to nobody at three in the morning
  escalation path : tested by paging it for real,
    12 times last year
  handover : a scheduled event with a checklist
  months without an unanswered page : 14
  escalations that ran out of levels : none
  verdict : ANSWERED
```

```
  paging the escalation path for real, monthly, is the
  part almost nobody does, and it is why the fourteen
  months mean something
```

```
membership
  a service has a rotation because : it is in the
    registry
  it is in the registry because : somebody added it,
    1 manual step
  a registered service with a broken rotation : visible,
    and the monthly test finds it
  an unregistered service : has no row to be broken
  services in that state : 44
```

```
  the coverage figure is complete over the registry and
  the registry is complete over what people remembered
```

```
the reported coverage
  numerator   : services with a named rotation
  denominator : services in the registry
  what adding a service to the registry requires : giving
    it a rotation
  so the ratio : 10000 per ten thousand, necessarily
  could it ever be lower : only if a registered service
    were left without one, which the form prevents
  what it therefore measures : nothing that can vary
```

```
an alert from an unregistered service
  does the service emit alerts : yes, the platform
    scrapes it like any other
  where does the alert route : the default receiver
  who reads the default receiver : it is a channel, not a
    person
  does it page : no
  does it count against the unanswered-page record : no;
    it was never a page
```

```
null control - enumerate the platform, diff the registry
  escalation tests : 12, unchanged
  jobs that enumerate the platform : 1
  services the check can see : 140
  running without a rotation : 0
  the rotation did not improve; the population it is
  measured against stopped being the list it is drawn
  from
```

```
what a fully covered rotation guarantees
  every registered service has someone who answers :
    exactly, tested monthly, 14 months clean
  every service has someone who answers : not addressed;
    the roster is built from a list people maintain, and
    a service that is not on it is not uncovered
```

```
a coverage ratio whose denominator is the same list as its
numerator cannot fall; the number that can is a comparison
against something the registry did not write, and nothing
here forms it
```

Every entry names a person rather than an alias, the escalation path is paged for real 12 times a year, handover has a checklist, and 14 months have passed with no unanswered page. A service is on the roster because it is in a registry somebody maintains by hand, so coverage reads 10000 per ten thousand of 96 services while 140 run - 44 of them under 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-rotation-covered-the-services-in-the-registry/the_rotation_covered_the_services_in_the_registry.eml
```
