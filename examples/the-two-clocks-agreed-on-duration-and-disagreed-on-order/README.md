# The two clocks agreed on duration and disagreed on order

`the_two_clocks_agreed_on_duration_and_disagreed_on_order.eml` - A request crosses three services and is timestamped at every hop. The end-to-end duration is trusted and the hop ordering is trusted. Only one of them is safe, and which is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Timestamping every hop is right and the setup is careful. NTP holds the fleet to within 40 milliseconds, which is a real measured bound and not a hope, and 40 ms is small against a request that takes a fifth of a second. The traces are used for two things: how long did this take, and what happened before what. Both look like questions about time and both are answered from the same field.

A duration that begins and ends on the SAME clock is exact however wrong that clock is, because the offset appears twice with opposite signs and cancels. The request enters at A and its final record is written at A, so the total is an A-minus-A subtraction and the 40 ms is not in it at all.

An ordering between two hops on DIFFERENT clocks is a single subtraction whose sign is the entire answer. There the offset does not cancel; it is the error term, and it is larger than most of the gaps being compared.

```
clock skew across the fleet : 40 ms, measured
```

```
hop                        gap    same clock   order reliable
  A sends    -> B receives     2     no           NO, gap is under the skew
  B receives -> B writes     5     yes          yes, one clock
  B writes   -> C reads     18     no           NO, gap is under the skew
  C reads    -> C reports     60     yes          yes, one clock
  C reports  -> A records     140     no           yes, gap exceeds the skew
```

```
  hops that cross a clock boundary : 3 of 5
  of those, ordering unreliable    : 2
```

```
end-to-end duration : 225 ms
  first timestamp written by : A
  last timestamp written by  : A
  clock offsets in the subtraction : one, twice, with opposite signs
  error in the total : 0 ms, exactly, at any skew
```

```
the same trace, two questions
  how long did this take    : 225 ms, exact
  did B write before C read : unknown, the gap is 18 ms and the skew is 40
  both answers come from the same five numbers
```

```
gap between two events on different clocks   can they appear reversed
  1 ms                                        yes
  5 ms                                        yes
  18 ms                                        yes
  39 ms                                        yes
  40 ms                                        no
  41 ms                                        no
  100 ms                                        no
```

```
  the boundary is exactly the skew, and it is a hard boundary
  below it the recorded order carries no information about the real one
```

```
one reversal, and what reads it
  the causal graph drawn from the trace shows C reading before B wrote
  which is impossible, so the reader concludes a bug in B
  the investigation looks at B, which is correct, and at nothing else
  B is fine; the ordering was never measured, only recorded
```

```
control - durations, which the same skew cannot touch
  hops measured on one clock   : 2
  milliseconds they account for: 65
  error in each                : 0 ms
  end-to-end total             : 225 ms, error 0 ms
  every duration in the trace is exact and every one was believed correctly
```

```
null control - the same 40 ms skew, hops wider than it
  P -> Q : 90 ms
  Q -> R : 200 ms
  R -> P : 150 ms
  hops with unreliable ordering : 0 of 3
  total duration                : 440 ms
  same skew, same clocks, same code path
  so the rule is not 'never order across clocks'
  it is 'an order across clocks is meaningless below the skew, and the skew
  is a number you already have'
```

```
what a bounded clock offset does to each kind of question
  duration on one clock        exact, the offset cancels
  duration between two clocks  off by at most the skew
  total with the same clock at both ends   exact
  order between two clocks     undefined below the skew
  a trace answers all four from one column
  and reports the same confidence for all four
```

NTP holds the fleet to 40 ms, which is measured and is small against a 225 ms request. The total is an A-minus-A subtraction so the offset cancels and the 225 ms is exact. 2 of the 3 cross-clock hops have gaps below 40 ms, and for those the recorded order says nothing about the real one - from the same five timestamps that gave the exact total.

Verify it yourself:

```bash
pnpm eml run examples/the-two-clocks-agreed-on-duration-and-disagreed-on-order/the_two_clocks_agreed_on_duration_and_disagreed_on_order.eml
```
