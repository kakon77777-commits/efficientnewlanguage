# The limit was never reached so it was never wrong

`the_limit_was_never_reached_so_it_was_never_wrong.eml` - The limit has been in the config for four years and has never been hit. What is known about the code behind it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Setting a limit is right and this one is well chosen: it is above every legitimate request anybody has made, it protects a downstream that really can be overwhelmed, and it has never rejected a good request. On every metric a limit is judged by, it is doing its job.

A limit that never binds is also a branch that never runs. Whether the code behind it works is a separate question from whether the number is right, and four years of never reaching it is four years of not asking.

Both the margin and the exercise count are computed from the same traffic.

```
configured limit : 2000 requests per minute
highest peak seen: 712
margin           : 1288, which is 64% of the limit
```

```
months in which the limit bound : 0 of 12
  so the rejection path has run 0 times in this window
```

```
how a limit is usually judged
  did it reject a legitimate request : no, 0 rejections
  is the number above real traffic   : yes, by 1288
  does the downstream survive        : yes, it has never been asked to
  every one of those is about the NUMBER, and none is about the code
```

```
the rejection path, step by step
  build the 429 response : ok
  read Retry-After from the config key : REFERS TO SOMETHING GONE
  emit the rate_limited metric : REFERS TO SOMETHING GONE
  log with the request id : ok
  release the connection : ok
  steps that still resolve : 3 of 5
  2 would fail the first time the branch runs, and the first time
  it runs is the minute the downstream is already in trouble
```

```
traffic over the window
  first month : 410, last month : 712
  growth : 302, which is 73%
  at 27 a month, the limit binds in about 47 months
  which is when the 2 broken steps run for the first time
```

```
exercising the branch deliberately
  requests needed : 1
  what it establishes : whether the 5 steps resolve
  what it does not establish : whether the number is right, which is the
  question everybody has been answering for four years
```

```
control - a service whose limit binds most months
  months it bound : 3 of 6
  the rejection path runs in production every month, so a step that stops
  resolving is noticed in that month rather than in four years
```

The number is well chosen and has never turned away a good request. What has never been asked is whether the code behind it still works, and a limit that never binds is a branch that never runs.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-never-reached-so-it-was-never-wrong/the_limit_was_never_reached_so_it_was_never_wrong.eml
```
