# The dependency was optional and the import was at the top

`the_dependency_was_optional_and_the_import_was_at_the_top.eml` - The feature checks whether its optional dependency is available before using it, in seven places, and every check is correct. How many of those checks run is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The capability checks are careful. Each one asks whether the library is present rather than assuming, each has a fallback that produces a usable result without it, the fallback is tested, and the feature's documentation says the dependency is optional and what is lost without it. Somebody thought about deployments that would not have it.

The import is at the top of the module. A missing optional dependency fails there, before any function in the module has been entered, so the check that would have handled its absence is downstream of the failure it exists for.

Sixty-two of three hundred and forty deployments do not have it.

```
deployments                     : 340
  with the package              : 278
  without it                    : 62
  share without                 : 1823 per ten thousand
```

```
capability checks in the code   : 7
  correct                       : 7
  reached where the package is absent : 0
startup failures                : 62
```

```
the capability handling
  asks whether the library is present : rather than assuming
  fallback producing a usable result  : yes, for each
  fallback tested                     : yes
  documentation says it is optional   : yes, and what is lost
  checks that are correct             : 7 of 7
  verdict                             : HANDLED
```

```
  somebody thought about the deployments that would not
  have it, and wrote for them
```

```
module load order
  the import          : at the top of the module
  when it runs        : before any function in the module
  what happens if the package is absent : the module fails
    to load
  when the first capability check runs  : inside a function
    in that module
```

```
  the handler is downstream of the failure it handles, and
  nothing in the module can see that from inside
```

```
the failure
  the process        : exits at start-up
  the message names  : the missing package
  the message names the feature : no
  the message says it is optional : no
  what an operator concludes : a missing requirement
  what they do next  : install it, or file a bug about the
    dependency list
```

```
the test environment
  packages installed  : all of them, including the optional
  why                 : the fallback tests compare against
    the real implementation
  so the top-level import : always succeeds under test
  a test that omits the package : none
```

```
null control - the import moved behind the check
  capability checks   : 7, unchanged, still correct
  deployments that start : 340
  checks reached where the package is absent : 7
  startup failures    : 0
  the handling did not improve; it became reachable
```

```
what a correct capability check guarantees
  the absent case is handled where the check runs : exactly
  the absent case is handled                      : not
    addressed; a check is code, code is in a module, and a
    module has to load before any of it runs
```

```
optionality is a property of the loading, not of the calling;
every guard in a file is downstream of that file's imports,
and a test environment that installs everything cannot
distinguish the two
```

All 7 capability checks are correct, each with a tested fallback and documentation saying what is lost. The import sits at the top of the module, so on the 62 deployments without the package - 1823 per ten thousand - the module never loads, 0 of the checks run, and the operator is shown a missing requirement rather than an optional feature that could have been skipped.

Verify it yourself:

```bash
pnpm eml run examples/the-dependency-was-optional-and-the-import-was-at-the-top/the_dependency_was_optional_and_the_import_was_at_the_top.eml
```
