# `__exit__`'s return value decides everything

`exception_suppressing_manager.eml` isolates the part of the
context-manager protocol that surprises people.

```
return False (or nothing)  ->  the exception propagates, as usual
return True                ->  the exception is SWALLOWED
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a lot of power hidden in a boolean. A manager
returning `True` unconditionally silently eats *every* failure inside its
block — code after the block runs as though nothing went wrong, and no
handler anywhere sees the error. It is the context-manager form of a bare
`except: pass`.

The three managers differ **only** in what `__exit__` returns, and the
program prints what actually happened, so the difference is visible
rather than asserted:

```
A. __exit__ returns True   -> execution continued past the raise
B. __exit__ returns False  -> caught outside, as expected
C. suppression on a budget of 2:
     attempt 1: failing        (absorbed)
     attempt 2: failing        (absorbed)
     attempt 3: failing -> escaped to the caller
     attempt 4: succeeded
   Budget 2: absorbed 2, escaped 1, clean exits 1.
```

C is the useful shape: absorb a few failures, then stop lying and let one
through — how a retry or circuit-breaker wrapper behaves.

## A limitation this case had to design around

EML-P has **no first-class exception objects**, which is why the budget is
counted rather than switched on the exception's type:

- `__exit__`'s first parameter is a plain **string** (`"ValueError"`) in
  the interpreter, and the class object `<class 'ValueError'>` in CPython.
- The third parameter is `None` here and a traceback object there.

So `exc_type == ValueError` cannot be written — `ValueError` is not a
value you can name — and printing `exc_type` or the traceback would
produce *different text* in the interpreter than in the transpiled
Python. Comparing against `None` does agree, and that is the one check
used.

Verify it yourself:

```bash
pnpm eml transpile examples/exception-suppressing-manager/exception_suppressing_manager.eml
pnpm eml run examples/exception-suppressing-manager/exception_suppressing_manager.eml
pnpm eml trace examples/exception-suppressing-manager/exception_suppressing_manager.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/exception-suppressing-manager/exception_suppressing_manager.eml   # -> OK (fixpoint)
```
