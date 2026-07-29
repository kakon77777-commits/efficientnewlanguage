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
C. selective: absorb ValueError, forward everything else
     absorbing a <class 'ValueError'>: expected, handled here
     forwarding a <class 'TypeError'>: unexpected, not ours to swallow
   Selective guard: absorbed 1, forwarded 1, clean 1.
```

C is the useful shape: swallow the failure you were built for, let
everything else through. A manager that returns `True` for *everything*
is the one that hides bugs.

## The type check, and why it is new

The third manager selects on the **exception type**:

```eml
if exc_type == ValueError:
    return True
```

That could not be written until now. EML-P had no first-class exception
objects: `__exit__`'s first parameter arrived as a plain **string**, so
`ValueError` was not a value you could compare against, and printing
`exc_type` gave `ValueError` where CPython gives `<class 'ValueError'>`.
Both were silent divergences from the Python projection.

Exception classes and instances are real values now, so all of this
matches CPython exactly:

```
    absorbing a <class 'ValueError'>: expected, handled here
    forwarding a <class 'TypeError'>: unexpected, not ours to swallow
  reached the outer handler: TypeError('unexpected, not ours to swallow')
```

Note `repr(e)` giving `TypeError('...')` while `str(e)` gives just the
message — the one place the two genuinely differ for exceptions.

**One gap remains, deliberately.** The third parameter (the traceback) is
`None` here and a traceback object in CPython. A real traceback's only
printable form embeds a memory address that differs between runs of
CPython *itself*, so there is no reproducible value to supply — inventing
one would be a fabrication, not a fix.

Verify it yourself:

```bash
pnpm eml transpile examples/exception-suppressing-manager/exception_suppressing_manager.eml
pnpm eml run examples/exception-suppressing-manager/exception_suppressing_manager.eml
pnpm eml trace examples/exception-suppressing-manager/exception_suppressing_manager.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/exception-suppressing-manager/exception_suppressing_manager.eml   # -> OK (fixpoint)
```
