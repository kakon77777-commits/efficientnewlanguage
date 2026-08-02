# Two different ways for a log to be illegal

`state_machine_trace_audit.eml` replays an event log against a state machine and reports what the machine did with each event - rather than whether the log as a whole is valid.

**What it exercises**: an event log can be illegal in at least two
unrelated ways, and a checker that returns one word collapses them. The
first rejection here is `approve` arriving in state `approved` - an
event out of order. The next three arrive in `shipped`, which is
terminal - the log simply kept going after the machine had stopped.

Those are different problems with different causes, and a validator that
stops at the first rejection never discovers the second kind at all.

So every event gets a verdict, applied plus rejected must equal the
number of events, and the final state is **re-derived** from only the
applied ones as an independent check that the audit and the replay agree.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
events in log:          7
applied:                3
rejected:               4
applied + rejected:     7
final state:            shipped
re-derived final state: shipped
applied events legal on replay: 3/3

Every event accounted for, and the final state re-derives from the applied ones.

The first rejection is `approve` from "approved" - a wrong-order event.
The next three are all from "shipped", a terminal state, which is a
different kind of problem entirely: the log kept going after the machine
had stopped. A checker that reports only 'invalid log' collapses those two
into one word, and a checker that stops at the first one never learns that
the trace ran three events past the end.
```
