# The test was shorter than the wrap

`the_test_was_shorter_than_the_wrap.eml` - The ordering check compares sequence numbers with a greater-than. How many messages that is correct for is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Comparing sequence numbers directly is the obvious implementation and it is right for every message the test suite sends. The numbers go up, later messages have bigger numbers, and a greater-than answers "is this newer" in one instruction with no state.

The field is sixteen bits, so the numbers do not go up forever - they go up and then start again. From the message after that, later messages carry smaller numbers, and the comparison answers the opposite of the question.

The message at which it turns over is computed rather than estimated, and the two rules are then evaluated at that message rather than by running to it.

```
sequence field : 65536 values, incrementing by 7
messages before the counter passes the end of the field : 9362
```

```
message   sequence   previous   naive says newer   modular says newer
  9360     65520      65513      yes                yes
  9361     65527      65520      yes                yes
  9362     65534      65527      yes                yes
  9363     5      65534      NO                 yes
  9364     12      5      yes                yes
```

```
the naive rule first answers wrongly at message 9363
  (computed as 9362 + 1, then checked: the rule holds at 9362 and fails here)
  the sequence goes 65534 to 5: the later message carries the
  smaller number, by 65529
```

```
test lengths that stop before that message : 3 of 4
  100 1000 5000 
  each of those suites passes, and each exercises the rule only on the
  stretch of its domain where it is correct
```

```
what a suite of 1000 messages proves
  the rule is right for the first 1000 messages : yes
  the rule is right                                : not asserted
  the suite would have to be about 9 times longer to reach the turn
```

```
at 50 messages a second
  the turn arrives after 187 seconds of traffic
  which is under an hour, so a peer reaches it on the first day and a
  suite that runs in seconds never does
```

```
over the 9 messages spanning the turn
  naive rule correct   : 8
  modular rule correct : 9
  messages the modular rule gets right and the naive one does not : 1
  it compares the distance rather than the values, and the distance
  does not wrap
```

```
control - the same rule on a much wider field
  messages before the turn : 142857142
  at 50 a second that is 33 days of continuous traffic
  the rule is then correct for every message a session will send, and
  the two rules are indistinguishable in practice
```

The comparison is correct for every message the suite sends and for the first 9362 a peer sends. The field ends, and the rule has no term for what happens after that.

Verify it yourself:

```bash
pnpm eml run examples/the-test-was-shorter-than-the-wrap/the_test_was_shorter_than_the_wrap.eml
```
