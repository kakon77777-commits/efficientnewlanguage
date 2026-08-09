# Abandoned work still lands — the caller stopped waiting and the work did not stop working

`abandoned_work_still_lands.eml` runs six requests through three handlers —
deadline only, deadline plus a cancel signal, and deadline plus an idempotency
key — and compares what the user was **told** against what the store ends up
holding.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a timeout is a bound on how long the *caller* waits.
That is its definition, and it is the right one, because the caller has a user
in front of it. Turning it into a bound on the work needs a second mechanism.

| handler | told ok | told failed | effects in store | intents | duplicated |
| --- | --- | --- | --- | --- | --- |
| deadline-only | 6 | 3 | **9** | 6 | **3** |
| cancel-signal | 6 | 3 | 6 | 6 | 0 |
| idempotent | 6 | 3 | 6 | 6 | 0 |

Per request under the deadline-only handler, every request that ran past the
deadline landed **two** effects: once from the abandoned call, once from the
retry the user sent after being told it failed.

```
requests reported as failed whose effect landed: 3
```

Note the `told failed` column: **it is 3 under all three handlers.** Neither
the cancel signal nor the idempotency key changes what the user is told. They
fix the store. The user still sees an error for something that happened, and
still retries.

Until a signal exists that the work reads, and a point before the write where
reading it still helps, "timed out" is a statement about the caller's patience
that the user reads as a statement about the outcome — and acts on.

Verify it yourself:

```bash
pnpm eml run examples/abandoned-work-still-lands/abandoned_work_still_lands.eml
```
