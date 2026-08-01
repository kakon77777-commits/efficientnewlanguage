# Deep config merge: the sibling that disappears

`nested_config_merge.eml` merges layered configuration — defaults, then
overrides — the way every “defaults, environment, command line” system
has to.

**What it exercises**: three rules, of which only the third is hard.

1. a key present only in the base survives
2. a key present in the override replaces it
3. **if both values are dicts, recurse instead of replacing**

Get (3) wrong and the merge becomes a shallow update: overriding one
nested key silently deletes its siblings. It is invisible in a small
test — `{"a": {"x": 1}}` overridden by `{"a": {"y": 2}}` gives
`{"a": {"y": 2}}`, which looks like a merge until you notice `x` is
gone.

The load-bearing check is `server.tls.cert`. The override touches
`server.tls.enabled` and says nothing about `cert`; a shallow merge
replaces the whole `tls` block and the certificate quietly vanishes.
Also checked: no key from either input disappears, every override leaf
wins, and merging a config with itself is the identity.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 12 lines)

```

base keys surviving:      10/10
override keys arriving:   7/7
override leaves winning:  4/4
un-overridden sibling kept: True
merging with itself is the identity: True

Deep merge: nothing lost, every override applied, siblings intact.

The one that matters is `server.tls.cert`. The override touches
server.tls.enabled and says nothing about cert; a shallow merge replaces
the whole tls block and the certificate quietly disappears.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`nested_config_merge.trace.jsonl` beside this file is the recorded execution.
