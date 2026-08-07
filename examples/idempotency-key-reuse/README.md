# Idempotency key reuse — the key says retry and the body says otherwise

`idempotency_key_reuse.eml` runs a request log containing genuine retries, key
reuse with a changed body, and unrelated requests through three policies, and
counts three outcomes separately.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the whole mechanism rests on an assumption nothing
checks — *same key means same request* — and clients break it constantly.

| policy | charges | wrong answers | retries not suppressed | rejected |
| --- | --- | --- | --- | --- |
| replay | 4 | **1** | 0 | 0 |
| reject | 4 | 0 | 0 | **1** |
| execute | **5** | 0 | 0 | 0 |

No policy is zero on all three. Replay returns the answer to a question the
caller did not ask — a caller sending 400 on a key carrying 250 is told 250,
with a 200 next to it. Reject is correct and requires storing the **request**,
not just the response. Execute abandons idempotency exactly when it was needed.

The control: with no key ever reused for a different body, all three policies
are **indistinguishable** — which is every client that generates a key
correctly, and every test.

And the part they all get right: no policy fails to suppress a genuine retry.
That is why the mechanism looks like it is working.

Verify it yourself:

```bash
pnpm eml run examples/idempotency-key-reuse/idempotency_key_reuse.eml
```
