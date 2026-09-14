# All the candidates passed after the filter emptied the set

`all_the_candidates_passed_after_the_filter_emptied_the_set.eml` - Every candidate release passed the safety gate this quarter, and each gate check is real. How many candidates reached the gate is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The gate is careful. It runs the full safety suite, not a subset; a single failing candidate blocks the release; it runs on every candidate that reaches it; and the pass rate is on a dashboard the release team reads.

An upstream filter, added to skip candidates without a signed manifest, matched the manifest field by a name that changed, so it forwarded no candidates.

```
candidates built                : 90
  reached the gate              : 0
  dropped by the filter         : 90
gate failures                   : 0
reported gate pass              : 100 per hundred
candidates that shipped ungated : 90
ungated share                   : 10000 per ten thousand
```

```
the safety gate
  runs : the full safety suite, not a subset
  a failing candidate : blocks the release
  over : every candidate that reaches it
  pass rate : on the release dashboard
  candidates it failed : 0
  verdict : 100 PER HUNDRED PASSED
```

```
  running the full suite and blocking on one failure is
  the part done right here, and it is why a real unsafe
  candidate at the gate would be stopped
```

```
the candidates the gate saw
  forwarded by the upstream filter : 
    0
  a pass rate over zero candidates : 100 per hundred,
    trivially
  what 'all passed' means here : the gate ran on nothing
  what it does not mean : that the releases were checked
  candidates that shipped without a gate : 
    90
```

```
the upstream filter
  intent : forward candidates with a signed manifest
  what it matched : the manifest field by a name that an
    earlier change renamed
  so candidates forwarded : 0
  did the gate notice its input dried up : no; a pass
    rate does not watch its own denominator
  is the 100 per hundred false : no; it is vacuously true
```

```
null control - assert input count equals build count
  pass rate over empty input : 100
  pass rate when empty is an error : 
    0
  candidates a count check would flag as ungated : 
    90
  no candidate and no check changed; an empty input
  stopped reading as a quarter of clean passes
```

```
what a 100 per hundred gate pass guarantees
  every candidate that reached the gate passed : exactly,
    full suite, blocking on a failure
  the releases were checked : not addressed; an upstream
    filter forwarded no candidates, and 'all of none
    passed' is vacuously true - 90 candidates shipped
    without ever reaching the gate
```

```
a gate reports on what arrives at it, and 'all passed' is loudest when nothing
arrives; a filter that quietly empties the input turns a safety gate into a
green light that guarded nothing
```

It runs the full suite and blocks on any failure over every candidate it sees - a true 100 per hundred. The upstream filter forwarded 0, so the pass rate is vacuous and 90 candidates shipped ungated, 10000 per ten thousand of the build.

Verify it yourself:

```bash
pnpm eml run examples/all-the-candidates-passed-after-the-filter-emptied-the-set/all_the_candidates_passed_after_the_filter_emptied_the_set.eml
```
