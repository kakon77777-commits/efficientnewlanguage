# The modules each compiled and the imports formed a cycle

`the_modules_each_compiled_and_the_imports_formed_a_cycle.eml` - Every module in the build compiles on its own, and each compile is real. What the import graph does is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The build is checked per module. Each of the sixty modules compiles in isolation; each declares its imports explicitly; the compiler errors on an unresolved name; and a module that compiles is cached and not recompiled.

Three modules import each other in a cycle.

```
modules                         : 60
  that compile alone            : 60
  that failed to compile        : 0
builds that failed              : 0
```

```
modules in the cycle            : 3
  as a share of all modules     : 500 per ten thousand
  with no valid init order      : 3
startups reading a half-init module : 1
```

```
the per-module build
  each module : compiles in isolation
  imports : declared explicitly
  on an unresolved name : the compiler errors
  a compiled module : cached, not recompiled
  modules that compiled : all 60
  verdict : BUILDS CLEAN
```

```
  erroring on an unresolved name is the part done right
  here, and it is why a missing symbol never slips
    through
```

```
the import graph
  what a single compile sees : one module and its
    declared imports
  what it does not see : whether the imports form a cycle
  the three modules : each imports the next, the last
    imports the first
  a cycle in initialization : has no order that runs each
    module after its dependencies
  so one module at startup : reads another before it is
    initialized
```

```
the program starting up
  modules loaded : all 60
  the cycle's init order : undefined; something must go
    first
  what the first of the cycle reads : a module still at
    its defaults
  startups that read a half-initialized module : 
    1
  did any module fail to compile : no; the fault is in
    the graph, which no compile sees
```

```
null control - a graph check over the imports
  cycles the per-module build reports : 
    0
  cycles the graph check reports : 
    1
  modules it would name : 3
  no module and no import changed; the check moved from
  one module at a time to the graph they form
```

```
what a clean per-module build guarantees
  each module compiles against its declared imports :
    exactly, all 60, the compiler errors on a missing name
  the program is well-formed : not addressed; each module
    compiles alone, and compiling alone does not see the
    import graph - 3 modules form a cycle, and one observes
    another half-initialized at startup
```

```
a property of each node is not a property of the graph; compilation ranges over
a module and its edges, and a cycle is a fact about the whole graph that no
single module's compile can hold
```

Every module compiles alone against its declared imports, the compiler errors on a missing name - the build is clean. Three modules import each other in a cycle, which no single compile sees, so initialization has no valid order and 1 startup reads a half-initialized module, under 0 build failures.

Verify it yourself:

```bash
pnpm eml run examples/the-modules-each-compiled-and-the-imports-formed-a-cycle/the_modules_each_compiled_and_the_imports_formed_a_cycle.eml
```
