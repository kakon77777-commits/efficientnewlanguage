# The token was refreshed early and the refresh needed the old one

`the_token_was_refreshed_early_and_the_refresh_needed_the_old_one.eml` - The client refreshes five minutes before expiry, which is the right pattern. What happens on a client whose clock is wrong is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The refresh logic is correct. It does not wait for a rejection, it renews on a margin, the margin was chosen to cover a slow network and a retry, and the renewal is idempotent so two in flight do no harm. On a machine whose clock is right, this never produces a failed call.

The margin is measured against the CLIENT's clock and the expiry is decided by the server's. A client that believes it is five minutes early is early by five minutes minus its own error, and that quantity can be negative.

Two thousand one hundred and forty clients are more than five minutes fast.

```
token lifetime, seconds       : 3600
refresh margin, seconds       : 300
skew of an affected client, s : 340
it refreshes late by, seconds : 40
```

```
clients                       : 18400
  within the margin           : 16260
  skewed beyond it            : 2140
rejected refreshes per minute : 128400
```

```
the refresh implementation
  renews on a margin rather than on rejection : yes
  margin covers a slow network and a retry    : yes
  two renewals in flight are harmless         : yes
  defects found in review                     : 0
  failed calls on a correct clock             : none
  verdict           : CORRECT
```

```
  this is the pattern the documentation recommends and it
  is implemented faithfully
```

```
the two clocks
  when the token expires   : the server's clock
  when the client renews   : the client's clock, minus
    the margin
  the effective margin     : 300 minus the client's error
  the client's error is known to it : no
```

```
  a margin against an unknown offset is a margin only
  while the offset is smaller than it
```

```
share of clients past the margin : 1163 per ten thousand
```

```
one affected client, in order
  1. believes it has 300 seconds left
  2. actually expired 40 seconds ago
  3. sends a refresh, authenticated with the expired token
  4. rejected
  5. the error handler responds by refreshing
  the loop exits when : the clock is corrected, or a
    person restarts it
```

```
null control - renew on the server's stated expiry
  refresh logic defects : 0, unchanged
  clients past the margin : 0
  rejected refreshes per minute : 0
  the margin did not grow; the quantity it is subtracted
  from stopped being the client's own reading
```

```
what refreshing on a margin guarantees
  the token is renewed before it expires : exactly, on a
    clock that agrees with the server's
  the token is renewed before it expires : not addressed
    otherwise, and the client cannot tell which case it
    is in
```

```
a safety margin absorbs a delay you can measure; against an
unmeasured offset it is a threshold, and the credential that
authorises the renewal is the one that has expired
```

The refresh logic is correct and review found 0 defects: it renews on a 300 second margin rather than on rejection, the margin covers a slow network, and concurrent renewals are harmless. 2140 of 18400 clients - 1163 per ten thousand - run more than that fast, so they refresh 40 seconds after expiry using the expired token, and 128400 rejections a minute feed the handler that retries.

Verify it yourself:

```bash
pnpm eml run examples/the-token-was-refreshed-early-and-the-refresh-needed-the-old-one/the_token_was_refreshed_early_and_the_refresh_needed_the_old_one.eml
```
