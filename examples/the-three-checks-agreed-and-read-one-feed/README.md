# The three checks agreed and read one feed

`the_three_checks_agreed_and_read_one_feed.eml` - Three independent checks confirm the reference price before a trade, and they have agreed on every trade this quarter. What they read is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The control is designed for independence. There are three checks, not one; they are owned by three teams; a trade blocks unless all three agree; and each logs its own value.

All three read the same upstream price feed.

```
checks                          : 3
  that agreed                   : 3
distinct upstream feeds         : 1
  redundant checks beyond one   : 2
```

```
days the feed published a wrong price : 4
  days any check disagreed      : 0
  days all three agreed wrongly : 4
trades in the quarter           : 890000
```

```
the three-way check
  checks : three, not one
  owners : three teams
  a trade blocks unless : all three agree
  logging : each its own value
  days all three agreed : every day
  verdict : PRICE CONFIRMED
```

```
  three separate owners is the part done right here, and
  it is why no single team can wave a price through
```

```
the source behind the checks
  feeds they read : one, shared
  what that makes three checks : one check run three
    times
  when the feed is right : all three agree, correctly
  when the feed is wrong : all three agree, wrongly, and
    the trade proceeds
  independence three owners add over the feed : none
```

```
the four days the feed was wrong
  checks that caught it : 0
  why : each read the same wrong number and matched it
  trades blocked those days : 0
  what three-way agreement proved : that they share a
    feed, not that the price was right
  wrong-price days as a share of the quarter : 
    444 per ten thousand
```

```
null control - two checks on independent feeds
  disagreements with a shared feed : 
    0
  disagreements with independent feeds : 
    4
  wrong-price days it would catch : 
    4
  no check changed; two stopped reading the same source
  the third does
```

```
what three agreeing checks guarantee
  three checks read the same value : exactly, three
    owners, a trade blocked unless all agree
  the value is corroborated : not addressed; the three
    checks read one feed, so they are one check run three
    times, and on 4 days they agreed on a wrong number
```

```
corroboration counts the independent sources, not the readers; three readers of
one source are one source, and unanimity among them is what a single wrong
upstream value produces
```

Three checks, three teams, a trade blocked unless all agree - unanimous every trade. All three read one feed, so they are one check thrice: on 4 days the feed was wrong they agreed wrongly and blocked nothing, 444 per ten thousand of the quarter, under 1 independent feed.

Verify it yourself:

```bash
pnpm eml run examples/the-three-checks-agreed-and-read-one-feed/the_three_checks_agreed_and_read_one_feed.eml
```
