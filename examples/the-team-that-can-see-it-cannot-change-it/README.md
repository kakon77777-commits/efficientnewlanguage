# The team that can see it cannot change it

`the_team_that_can_see_it_cannot_change_it.eml` - The platform team can see every one of these findings. How many of them anyone can act on is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Centralising the view is right. One team watching every service spots the patterns no single service owner can see, applies one standard everywhere, and does not need eight teams to each build the same dashboard. The findings are real, reproducible and correctly attributed.

Seeing and being able to change are two permissions, and centralising the first one moved it away from the second. A finding is acted on when one party holds both, and neither team here holds both for most of the list.

The overlap is computed per finding.

```
findings : 8
```

```
the platform team
  can see       : 8 of 8
  can change    : 1 of 8
the service owners
  can change    : 6 of 8
  were told     : 3 of 8
```

```
findings where one party holds both permissions : 3 of 8
  5 are visible to somebody and changeable by somebody else
```

```
finding   service         who could act
  f1      shared-lib     the platform team
  f2      checkout     the owning team
  f3      search     the owning team, once told
  f4      legacy-report     nobody - the service has no owner
  f5      auth     the owning team
  f6      billing     the owning team, once told
  f7      ingest     the owning team, once told
  f8      mailer     nobody - the service has no owner
```

```
what the remaining 5 need
  a message to the owner : 3
  an owner at all        : 2
  and those two numbers account for all of them
```

```
if every finding were routed to its owner tomorrow
  actionable : 6 of 8
  up 3 from 3, by sending messages and changing no code
  the last 2 are unchanged, because routing needs a recipient
```

```
what the centralised view is still the right place for
  finding the pattern across services : 8 findings, one standard
  proving the finding is real         : reproducible before it is sent
  knowing whether it was fixed        : the same view sees the after state
  none of those requires the change permission, and all of them are lost if
  each team watches only itself
```

```
control - a team watching services it owns
  findings : 3, actionable : 3
  all of them, because seeing and changing are the same party here
  so this team's fix rate says nothing about routing, which it never needed
```

The central view is worth having and every finding in it is real. Acting needs the same party to hold the view and the write access, and centralising one of those two is what separated them.

Verify it yourself:

```bash
pnpm eml run examples/the-team-that-can-see-it-cannot-change-it/the_team_that_can_see_it_cannot_change_it.eml
```
