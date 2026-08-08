# Rate numerator outgrows denominator — the clamp removed the evidence and kept the error

`rate_numerator_outgrows_denominator.eml` computes a conversion rate three ways
— with mismatched populations, with the mismatch clamped to 100%, and with both
sides drawn from the same population — and reports how many segments each one
gets wrong.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: conversions come off the event table, because that is
where conversions are. Visitors come off a curated view that excludes bots and
internal traffic, because that view was built by the team who got tired of bots
in their visitor charts. Both numbers are right; they answer questions about
different populations.

| segment | conversions (all) | visits (clean) | mismatched | clamped | consistent |
| --- | --- | --- | --- | --- | --- |
| ads | 3 | 2 | **150.0** | 100.0 | 50.0 |
| organic | 1 | 4 | 25.0 | 25.0 | 25.0 |
| email | 4 | 1 | **400.0** | 100.0 | 100.0 |
| partner | 1 | 3 | 33.3 | 33.3 | 33.3 |
| social | 2 | 5 | **40.0** | **40.0** | **20.0** |

```
segments where the mismatched rate is impossible (>100): 2
segments where the mismatched rate is wrong:             3
segments where the CLAMPED rate is wrong:                2
```

The impossible rate is noticed — once — and clamped. The clamp is one line, it
makes the dashboard sane, and it silences exactly the two segments that were
announcing the bug. `social` is the one that matters: reported **40.0** against
a true **20.0**, never above 100, never flagged, wrong by a factor of two.

Every mismatched rate is at least the consistent one. The bias has a direction,
because the numerator is drawn from the larger population.

A ratio carries an assumption its two operands do not: that they describe the
same population. Nothing in a division sign says so, no type system checks it,
and both operands can be individually correct and separately owned.

Verify it yourself:

```bash
pnpm eml run examples/rate-numerator-outgrows-denominator/rate_numerator_outgrows_denominator.eml
```
