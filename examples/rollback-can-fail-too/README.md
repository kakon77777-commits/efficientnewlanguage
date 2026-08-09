# Rollback can fail too — every state it can stop in is one the system cannot name

`rollback_can_fail_too.eml` sweeps every cancellation point of a four-step
operation against every undo that can refuse, and classifies the resulting
state.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: cancelling halfway means reversing what was already
done, and each reversal is a real operation against a real system that can fail
exactly like the forward step can.

```
cancel after  undo that fails  steps still applied           end state
4             none             -                             start
4             reserve          reserve                       STUCK
4             charge           reserve charge                STUCK
4             ship             reserve charge ship           STUCK
4             notify           reserve charge ship notify    no-op
```

20 combinations: **6 stuck**, 4 that achieved nothing at all, 10 clean.

```
cancellation points that end stuck when no undo fails: 0 of 4
```

The unwinder is correct. That is the only scenario the tests cover, because
writing a test for a failing undo means first believing the undo can fail — and
the undo path has the least coverage of anything in the system for a structural
reason: it only runs when something is cancelled.

Which failures matter:

```
reserve   refusing to reverse leaves 4 of the 4 cancellation points stuck
charge    refusing to reverse leaves 3 of the 4 cancellation points stuck
ship      refusing to reverse leaves 2 of the 4 cancellation points stuck
notify    refusing to reverse leaves 0 of the 4 cancellation points stuck
```

The earliest undo is the worst, because everything that reached it has to pass
back through it.

**A conflation, kept in the file.** The classifier first compared the remaining
steps against the operation's *total* step count, which merged two different
end states: "the cancellation achieved nothing" and "the operation ran to
completion". Cancelling after step 1 and failing to reverse step 1 leaves one
step applied out of four — the operation did not complete, and the cancellation
did not happen either. The reference for "no-op" is how many steps had been
applied *at the moment of cancellation*.

The forward path has a name for every state it passes through — those names are
what the feature is made of. The reverse path's stopping points were never
enumerated, so a failure partway leaves the system in a condition with no status
value, no dashboard row, and no query that finds it.

Verify it yourself:

```bash
pnpm eml run examples/rollback-can-fail-too/rollback_can_fail_too.eml
```
