# The policy applied at admission and the old resources stayed

`the_policy_applied_at_admission_and_the_old_resources_stayed.eml` - A policy engine sits in the admission path, refuses non-compliant resources rather than reporting them, has no exemption mechanism, and has blocked nineteen hundred creations. Which resources it has seen is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The enforcement is genuine. It is in the admission path rather than a report somebody reads on Friday, so a non-compliant resource is not created at all; there is no annotation that opts a workload out, so there is no quiet path around it; the rules are the ones the security review asked for rather than whatever the default bundle contained; and it has refused nineteen hundred creations, each of which someone then fixed.

The engine runs on create and update. A resource that predates the policy, and has not been touched since, has never been evaluated.

Twenty thousand six hundred of them have not.

```
policy engines in the admission path : 1
creations blocked               : 1900
exemption annotations available : 0
bypasses of the admission path  : 0
```

```
resources                       : 24000
  created or updated since      : 3400
  never evaluated               : 20600
  share evaluated               : 1416 per ten thousand
  share never evaluated         : 8583 per ten thousand
scheduled audits of existing resources : 0
```

```
the policy engine
  where it runs : the admission path
  on non-compliance : refuses; the resource is not
    created
  exemption annotation : 0, so there is no quiet path
    around it
  the rules : the ones the security review asked for, not
    a default bundle
  creations refused : 1900, each then fixed
  verdict : ENFORCED AT THE DOOR
```

```
  refusing rather than reporting, with no exemption, is
  what makes this enforcement instead of advice
```

```
the trigger
  evaluated on : create and update
  a resource created after the policy : evaluated
  a resource updated after the policy : evaluated
  a resource older than the policy, untouched : never
  is that a gap in the rules : no; the rules are correct
    and nothing has asked them about these
  resources in that state : 20600
```

```
  the engine is complete over the events it hooks and the
  fleet is a state rather than a stream of events
```

```
what gets reported
  policy violations in production : none
  is that figure correct : yes, over what was evaluated
  what was evaluated : 3400 of 24000
  what a reader hears : the fleet is compliant
  what is claimed : nothing non-compliant was admitted
  the difference : 20600 resources
```

```
which resources are in the gap
  selected by : not having changed
  therefore : the oldest, and the least maintained
  likelihood of violating the rules : higher than the
    evaluated set, not lower
  what would bring one in : any edit at all
  what discourages editing them : they work, and nobody
    owns them
```

```
the day one of them is edited
  the edit : something small and unrelated
  what admission does : evaluates the whole resource
  likely outcome : refused
  what the engineer sees : a policy failure on a change
    that did not cause it
  when the violation began : before the policy existed
  when it is discovered : now, by accident
```

```
null control - the same rules run on a schedule too
  admission enforcement : unchanged, still refusing
  scheduled audits : 1
  resources evaluated : 24000
  never evaluated : 0
  the policy did not change; it stopped being asked only
  about things that were changing anyway
```

```
what admission-time enforcement guarantees
  nothing non-compliant is admitted : exactly, with no
    exemption and no bypass, 1900 times over
  nothing non-compliant exists : not addressed; the
    engine is bound to an event and existence is not one
```

```
a control on a transition evaluates whatever crosses it, so
its coverage is the change rate rather than the population;
the resources it never sees are selected for not changing,
which is the same thing as being old
```

The engine sits in the admission path, refuses rather than reports, offers 0 exemption annotations, has 0 bypasses, and blocked 1900 creations that were then fixed. It evaluates on create and update, so 3400 of 24000 resources have been seen - 1416 per ten thousand - and the 20600 that have not, 8583 per ten thousand, are the ones nobody has touched, audited by 0 jobs.

Verify it yourself:

```bash
pnpm eml run examples/the-policy-applied-at-admission-and-the-old-resources-stayed/the_policy_applied_at_admission_and_the_old_resources_stayed.eml
```
