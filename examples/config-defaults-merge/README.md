# Presence is not truthiness

`config_defaults_merge.eml` layers user settings over defaults, and shows
the mistake that makes this harder than it looks.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `in` for key presence, dict iteration for a stable
report order, and the distinction between a key that is **absent** and a
key that is present but **falsy**.

```
key       value   from
--------- ------- --------
verbose   False   user
retries   3       default
timeout   5       user
colour    True    default

Presence is not truthiness
  "verbose" in overrides -> True, and its value is False
  "retries" in overrides -> False
```

The subtle case is `verbose`. The user set it to `False`; the default is
`True`. Writing the merge as

```python
if overrides[key]:      # WRONG
    return overrides[key]
```

would treat the explicit `False` as "nothing here", fall back to the
default, and silently re-enable a feature the user deliberately turned off.

The fix is to ask about **presence** with `in`, and only then look at the
value. It costs nothing and it is the difference between honouring a
setting and ignoring it.

Verify it yourself:

```bash
pnpm eml run examples/config-defaults-merge/config_defaults_merge.eml
pnpm eml trace examples/config-defaults-merge/config_defaults_merge.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/config-defaults-merge/config_defaults_merge.eml   # -> OK (fixpoint)
```
