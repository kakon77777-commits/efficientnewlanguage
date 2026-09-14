# The flag was the string false

`the_flag_was_the_string_false.eml` - The feature is gated behind a config flag and the gate reads the flag on every request. What the flag's value is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The gate is careful. It reads the real config value, not a default baked into the binary; it reads it fresh each request, not once at boot; the flag is present in config, not missing; and the gate is a plain if on that value.

The value arrived from JSON/env as the string "false", and a non-empty string is truthy.

```
requests in the window          : 2000000
  saw the feature ON            : 2000000
  saw the feature OFF           : 0
config reads that failed        : 0
the flag was meant to gate OFF  : 0
feature-on share                : 10000 per ten thousand
```

```
the feature gate
  reads : the real config value, not a baked default
  when : fresh on every request, not once at boot
  flag present in config : yes, set to false
  the gate : a plain if on the value
  requests that read stale config : 0
  verdict : GATE EVALUATED EVERY REQUEST
```

```
  reading fresh each request rather than caching at boot
  is the part done right here, and it is why a real toggle
  would take effect at once
```

```
the flag's value as loaded
  what config says : false
  how it arrived : as the JSON/env string "false"
  what the gate tests : if (flag)
  what a non-empty string is : truthy
  so if ("false") : is taken, the feature is ON
```

```
the operator who set false
  what they meant : the feature is off
  what the gate did : turned it on for everyone
  requests affected : 2000000
  is the gate reading the wrong key : no; it reads the
    right flag
  is the string "false" a false value : no; only an empty
    string is falsy, and "false" is five characters
```

```
null control - parse the flag to a boolean
  feature on, string truthiness : 
    10000 per ten thousand
  feature on, parsed boolean : 0
  requests correctly gated off : 2000000
  no config and no gate location changed; the value
  stopped being judged by its length instead of its
  meaning
```

```
what a fresh-read config gate guarantees
  the gate evaluates the current config value each
    request : exactly, no stale boot-time cache
  the feature is off when the flag is false : not
    addressed; the value is the string "false" and a
    non-empty string is truthy, so if (flag) is taken and
    the feature ran ON for all 2000000 requests
```

```
a boolean gate needs a boolean, and a string that spells a boolean is not one;
'false' as text is truthy because it is non-empty, so the flag reads as its own
opposite the moment it is not parsed
```

It reads the real flag fresh on every request with a plain if - the gate ran every time. The value is the string "false", which is truthy, so if (flag) was taken and the feature was ON for all 2000000 requests the flag meant to gate off, 10000 per ten thousand.

Verify it yourself:

```bash
pnpm eml run examples/the-flag-was-the-string-false/the_flag_was_the_string_false.eml
```
