# Path resolved twice — the check and the write agreed on the name, not the document

`path_resolved_twice.eml` runs three requests against every point at which a
rename can be interleaved, under two handlers: one that resolves the name twice
(once to authorise, once to act) and one that resolves it once and carries the
identity.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: an authorisation check answers a question about an
*object*, and it was handed a *name*. Names are mutable pointers — that is what
they are for.

| handler | writes | landed on a document the caller does not own |
| --- | --- | --- |
| two-resolves | 7 | **1** |
| resolve-once | 7 | **0** |

Both handlers write **the same number of times**. The defect does not add a
write or raise an error; it moves one write to a different document. A count of
writes, of failures, or of denials sees nothing at all — which is why the
observable here is *who owns the document that actually received the write*,
read back out of the store after the fact.

The window is exactly one interleaving wide:

| rename at | requests where the handlers disagree |
| --- | --- |
| before | 0 |
| **between** | **1** |
| after | 0 |
| never | 0 |

`before` and `after` agree because they land outside the gap. The gap only
exists in the handler that has two resolves, and the rename itself is a legal
operation no permission check would refuse — it repoints a path, it does not
touch a document.

This is not the ordinary lost-update race. The value does not change under the
write; the **subject** does.

**A wrong premise, kept in the file**: the "the safe handler still does the
work" check first read `once_writes >= 8` and measured 7. That threshold was
typed rather than derived — three requests × four interleavings is twelve
scenarios, of which `bob` is refused in all four and `ann` in the one where the
rename lands before the check, so seven was the right answer and the number was
the wrong question. It now reads `once_writes * 2 > scenarios`, with
`scenarios` counted by the sweep.

Verify it yourself:

```bash
pnpm eml run examples/path-resolved-twice/path_resolved_twice.eml
```
