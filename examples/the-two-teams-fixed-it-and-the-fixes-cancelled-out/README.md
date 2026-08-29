# The two teams fixed it and the fixes cancelled out

`the_two_teams_fixed_it_and_the_fixes_cancelled_out.eml` - An invoice total was off by the tax amount. Two teams found it and each shipped a correct fix. What the invoice does now is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both fixes are right and both were done properly. The billing team found that the line-item subtotal was being sent without tax and added the tax before sending, which is correct: the field is documented as tax-inclusive. The ledger team found that the field it received was documented as tax-inclusive but arrived without tax, and added the tax on receipt, which is also correct against the same document. Each team wrote a test that pins its own fix, and both tests pass.

A correction is relative to a state. Two corrections applied to one value are only both right if each was written against the state the other leaves.

Neither team was wrong about the defect. They were each right about a system that no longer existed by the time both changes had shipped.

```
subtotal      : 10000 cents
tax rate      : 875 per ten thousand
tax           : 875 cents
correct total : 10875 cents
```

```
state                        value sent   value recorded
  before either fix            10000        10000
  after the billing fix        10875        10875
  after the ledger fix too     10875        11750
```

```
  correct value : 10875
  recorded now  : 11750
  error         : 875 cents over, which is exactly the tax
```

```
  error before any fix : 875 cents, under
  error after both     : 875 cents, over
  magnitude            : identical
  sign                 : reversed
```

```
  the same number of complaints, from the other direction,
  and now the ones complaining have been overcharged
```

```
the billing team's test
  given a subtotal of 10000, the message carries 10875
  status : passes, and it is the right assertion
```

```
the ledger team's test
  given a message carrying 10000, the ledger records 10875
  status : passes, and it is the right assertion
```

```
  the two tests share no fixture
  the second one's input is a value the first one no longer produces
```

```
an end-to-end fixture
  input     : a subtotal of 10000
  expected  : a ledger entry of 10875
  actual    : 11750
  would fail : yes
  exists    : no, the boundary is where the two teams meet
```

```
invoices per day          : 24000
days with both fixes live : 9
invoices affected         : 216000
overcharged, in cents     : 189000000
```

```
day   invoices   cents over that day   cumulative
  1     24000      21000000               21000000
  2     24000      21000000               42000000
  3     24000      21000000               63000000
  4     24000      21000000               84000000
```

```
the discrepancy alert on total mismatch
  before either fix : firing, 875 cents per invoice
  after one fix     : silent
  after both fixes  : firing, 875 cents per invoice
```

```
  the alert went quiet and then came back with the same
  magnitude, and the second firing was read as a regression
  of a fix that had shipped, rather than a second one
```

```
control - is either fix wrong
  billing fix alone : 10875, correct
  ledger fix alone  : 10875, correct
  tests passing     : both
  reviews           : both approved, correctly
  defects in either change : 0
```

```
  reverting either one restores the correct total,
  which is why each team's first instinct is to defend theirs
```

```
null control - the same two teams with an unambiguous contract
  fixes proposed  : 2
  fixes that match the contract : 1
  fixes shipped   : 1
  final total     : 10875
  same defect, same teams, same speed
  what changed is that the document had one reading
```

```
what a correct fix is correct relative to
  the behaviour its author observed : yes, and that was measured
  the behaviour after another change : not addressed
  and a fix carries no record of the state it assumed
```

```
two teams looking at one boundary from opposite sides will
describe the same defect in opposite words, and the test that
separates them is the one whose input and output are on
different sides of the boundary
```

Both fixes are correct against the document and against the system each team observed: applied alone they produce 10875 and 10875 cents, both right, with 0 defects in either change and both tests passing. Applied together they produce 11750 against a correct total of 10875 - 875 cents over, the same magnitude as the original error with the sign reversed - across 216000 invoices in 9 days, and the alert that fired again was read as a regression.

Verify it yourself:

```bash
pnpm eml run examples/the-two-teams-fixed-it-and-the-fixes-cancelled-out/the_two_teams_fixed_it_and_the_fixes_cancelled_out.eml
```
