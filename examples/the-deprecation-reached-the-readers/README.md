# The deprecation reached the readers

`the_deprecation_reached_the_readers.eml` - The deprecation was announced in every channel the team has. How many callers that reached is computed below; stating it here would be a number nothing checks.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The announcement was thorough: release notes, changelog, a blog post, a banner in the dashboard and a mailing list. Each of those is a real channel with real subscribers, and the team can name every one of them.

Who reads a channel and who calls the endpoint are two different sets, and only one of them is measurable from inside the team. The other is visible in the request logs, which is where the callers actually are.

The overlap is computed here rather than assumed, per channel.

```
callers : 11
```

```
channel            callers it reaches
  release notes : 3 of 11
  the blog : 1 of 11
  the dashboard : 3 of 11
  the mailing list : 3 of 11
```

```
reached by at least one channel : 4 of 11
reached by none                 : 7
```

```
cumulative reach, adding one channel at a time
  through release notes : 3
  through the blog : 3
  through the dashboard : 4
  through the mailing list : 4
```

```
the callers no channel reaches
  c2
  c3
  c5
  c7
  c8
  c10
  c11
  count : 7
  they have one thing in common: they appear in the request log
```

```
a warning header on the response itself
  callers it reaches : 11 of 11
  more than all four announcement channels together, by 7
  because the audience is defined by the same act as the usage
```

```
control - a partner integration programme, where callers subscribe
  reached : 3 of 3
  here announcing is exactly the right instrument
```

Every channel is real and every one has subscribers. Who subscribes and who calls are two populations, and the deprecation was addressed to the one the team can see.

Verify it yourself:

```bash
pnpm eml run examples/the-deprecation-reached-the-readers/the_deprecation_reached_the_readers.eml
```
