# The shares were rounded and summed to 101

`the_shares_were_rounded_and_summed_to_101.eml` - Three shares of a whole are each rounded to a correct whole percent, and each rounding is right. What they sum to is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rounding is done properly per share. Each true share is rounded half-up to the nearest whole percent; the same rule is used for all three; none is truncated; and each displayed percent is within half a point of its true share.

The three true shares sum to exactly the whole.

```
share A                         : 3350 per ten thousand
share B                         : 3350 per ten thousand
share C                         : 3300 per ten thousand
true total                      : 10000 per ten thousand
```

```
share A rounded                 : 34 percent
share B rounded                 : 34 percent
share C rounded                 : 33 percent
rounded shares sum to           : 101 percent
true total                      : 100 percent
  the excess                    : 1 percent
```

```
the per-share rounding
  rule : round half-up to the nearest whole percent
  applied to : all three, identically
  truncation : none
  each displayed percent : within half a point of its
    share
  shares off by more than half a point : 0
  verdict : EACH SHARE CORRECT
```

```
  holding half-up for every share is the part done right
  here, and it is why no single percent is misrounded
```

```
the sum of the rounded shares
  what it should be : 100, the whole
  what it is : 101
  why : two shares at exactly 33.5 each round up
  what rounding does to a sum : it does not preserve it;
    the roundings do not cancel
  the invariant broken : the parts add to the whole
```

```
the reader of the breakdown
  the three percents shown : 34, 34, 33
  their sum : 101
  is any single share wrong : no; each is the correct
    rounding of its value
  is the breakdown consistent : no; it claims 1 point
    more than exists
  where the extra point is : in no share, between them
```

```
null control - show the last as the remainder
  independent rounding sum : 101 percent
  largest-remainder sum : 100 percent
  shares whose value changed : 0
  no share's value changed; one figure became the whole
  minus the others rather than an independent rounding
```

```
what correctly rounded shares guarantee
  each share is within half a point of its value : exactly,
    half-up, same rule, none truncated
  the shares account for the whole : not addressed; each
    share was rounded independently, and three that truly
    sum to 100 round to 34+34+33 = 101,
    because rounding does not preserve a sum
```

```
rounding each part keeps each part honest and lets their total drift; the
constraint that parts sum to a whole is a property of the set, and rounding
them one at a time is blind to it
```

Each share is rounded half-up, same rule, within half a point - none is wrong. Two sit at exactly 33.5 and round up, so the parts sum to 101 where the whole is 100: 1 point that is in no share and breaks parts-sum-to-the-whole.

Verify it yourself:

```bash
pnpm eml run examples/the-shares-were-rounded-and-summed-to-101/the_shares_were_rounded_and_summed_to_101.eml
```
