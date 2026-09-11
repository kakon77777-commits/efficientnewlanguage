# The idempotency key was regenerated on each retry

`the_idempotency_key_was_regenerated_on_each_retry.eml` - Every charge went through an idempotent endpoint, and the server's dedup is correct. What the key is per is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The server side is right. It stores each idempotency key it has seen; a repeat of a stored key returns the first result instead of charging again; the store is durable; and the window is long enough to cover any retry.

The client mints a fresh key for every attempt, including retries.

```
payments intended               : 50000
retries that fired              : 3800
keys the client minted          : 53800
  the server had never seen     : 53800
dedup hits on a retry           : 0
```

```
charges made                    : 53800
distinct payments intended      : 50000
duplicate charges               : 3800
overcharge rate                 : 760 per ten thousand
```

```
the idempotent endpoint
  stores : every key it has seen
  on a repeat of a stored key : returns the first result
  store durability : durable
  window : longer than any retry
  keys correctly deduplicated : every repeat that arrived
  verdict : IDEMPOTENT
```

```
  returning the stored result rather than recomputing is
  the part done right here, and it is why a repeated key
  is safe
```

```
the key the dedup is on
  what makes two requests the same : an equal key
  who chooses the key : the client, per attempt
  what the client does on a retry : mint a new one
  so a retry of one payment : arrives as a key the server
    has never seen
  retries that looked like repeats to the server : 
    0
```

```
the account being charged
  payments it authorized : 50000
  charges that landed : 53800
  duplicates : 3800
  did the server misbehave : no; every distinct key was
    a distinct request as far as it could tell
  the safety it was promised : 760 per ten thousand
    of intended payments charged twice
```

```
null control - key derived from the payment, not minted
  distinct payments : 50000, unchanged
  duplicate charges : 0
  retries now deduplicated : 3800
  no server logic changed; the key stopped being new on
  each attempt and started being a property of the payment
```

```
what an idempotent endpoint guarantees
  the same key twice charges once : exactly, from a
    durable store with a long window
  each payment happens once : not addressed; dedup is by
    the key, and the client mints a new key on every
    retry, so 3800 retries became 3800 keys the
    server had never seen and 3800 extra charges
```

```
idempotency is a property of a key, and safety is a property of the payment
only when the key is a property of the payment; a key minted per attempt makes
every retry a new request the dedup cannot recognize
```

The server stores every key and returns the first result on a repeat - correct idempotence. The client mints a new key per attempt, so 3800 retries were 3800 unseen keys and 3800 duplicate charges, 760 per ten thousand of intended payments, under 0 retries the dedup recognized.

Verify it yourself:

```bash
pnpm eml run examples/the-idempotency-key-was-regenerated-on-each-retry/the_idempotency_key_was_regenerated_on_each_retry.eml
```
