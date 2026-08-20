# The default swallowed a real zero

`the_default_swallowed_a_real_zero.eml` - A missing setting falls back to the default. How many settings that are present also fall back is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Defaulting when a field is absent is right and every configuration system does it. Callers should not have to write out every key, a sensible default is better than an error for an optional setting, and the rule is one line.

The test asks whether the value is empty, not whether it was supplied. Zero, the empty string and the empty list are all values somebody may have chosen deliberately, and each of them is empty. The rule cannot distinguish "not given" from "given as nothing", and one of those wants the default.

Every setting is run through both rules.

```
settings : 8
```

```
key           supplied   value   by emptiness   by presence
  retries      yes        0       3             0
  timeout_s      yes        30       30             30
  prefix      yes        0       0             0
  batch_size      no         0       50             50
  rate_limit      yes        0       100             0
  tag      yes        0       0             0
  workers      yes        8       8             8
  debug      no         0       0             0
```

```
settings the two rules disagree about : 2 of 8
  each of those was supplied as 0 and is being read as the default
```

```
supplied as 0 with a non-zero default : 2
  retries : asked for 0, will run at 3
  rate_limit : asked for 0, will run at 100
```

```
supplied as 0 where the default is also 0 : 2
  the rule is wrong about these too, and nothing observable follows
  from it, so they will not appear in any bug report
```

```
what each of the disagreeing settings was asking for
  retries 0    : do not retry, which is a real policy
  rate_limit 0 : unlimited or disabled, depending on the system
  retries has a default of 3, so a caller asking for none gets 3
```

```
the two tests, side by side
  value is empty  : one comparison against the value
  key is absent   : one lookup in the same parsed object
  both are one line and only one of them answers the question asked
```

```
control - a setting where 0 is not a choice anybody makes
  disagreements : 0 of 2
  the two rules agree everywhere here, so this setting cannot show the
  difference between absent and zero
```

Defaulting an absent setting is correct and the rule is one line. It tests the value where the question is about the key, and zero is a value somebody typed.

Verify it yourself:

```bash
pnpm eml run examples/the-default-swallowed-a-real-zero/the_default_swallowed_a_real_zero.eml
```
