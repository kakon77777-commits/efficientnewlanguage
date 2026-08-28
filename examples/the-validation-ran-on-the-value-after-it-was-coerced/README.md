# The validation ran on the value after it was coerced

`the_validation_ran_on_the_value_after_it_was_coerced.eml` - Quantity must be an integer between 1 and 999. The validator has never accepted a value outside that range. How many orders ship a quantity the customer did not choose is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Coercing before validating is the right order and it is what makes the validator simple. A form submits strings; a database column holds an integer. Something has to turn one into the other, and doing it once at the edge means the validator, the business rules and every later reader all work with a number instead of each re-parsing a string and disagreeing about how. Normalising early is standard advice and it is good advice.

The coercion also has a default, because a parse that can fail needs an answer for the failing case, and returning 1 for a missing quantity is friendlier than an error page. Quantity 1 is the most common value on the form, so it is also the best guess.

The validator sees what the coercion produced. It never sees a missing field, because a missing field is not what reaches it - a 1 does. The rule is enforced perfectly against a population the coercion has already made legal.

```
rule : quantity must be an integer from 1 to 999
coercion : parse to integer, and use 1 when there is nothing to parse
```

```
raw input    coercion gives   validator   customer chose it
  42        42              accepts     yes
  0042        42              accepts     yes
  abc        parse error     rejects     -
  0        0     rejects     -
  (empty)    1               accepts     NO
  (absent)    1               accepts     NO
```

```
  values the validator accepts        : 4
  of those, values nobody chose       : 2
  values outside 1..999 that got through : 0
```

```
the validator's own record
  values it has seen outside 1..999 : 0
  values it has wrongly accepted    : 0
  values it has wrongly rejected    : 0
  its accuracy against its input    : 100 percent
```

```
  it is a correct rule about integers
  the thing that decides what integer arrives is upstream of it
```

```
orders per day                 : 12000
quantity field left empty      : 30 per thousand
orders defaulted to 1 per day  : 360
orders defaulted per quarter   : 32400
```

```
  every one of them is a valid order for one unit
  none of them is an order the customer placed for one unit
```

```
layer                what it receives          can it tell the difference
  form                 empty field               yes, it is empty
  coercion             empty field               yes, that is why it defaults
  validator            the integer 1             no
  business rules       the integer 1             no
  warehouse            the integer 1             no
  customer             one item                  yes, on arrival
```

```
  the information exists at exactly two points and neither of them is
  a place where anything is decided
```

```
coercion that fails instead of defaulting
  empty field           -> parse error -> rejected
  absent field          -> parse error -> rejected
  orders defaulted per quarter : 0
  orders rejected per quarter  : 32400
  and each rejection is a form the customer can correct
```

```
control - is the rule itself correct
  lower bound  : 1, correct
  upper bound  : 999, correct
  integer check: correct
  off-by-one   : none, both bounds tested
  defects in the rule : 0
```

```
  a test suite for a validator supplies values TO it
  and every value it can supply has already been through the coercion
```

```
null control - the same order of operations, coercion with no default
  coercion runs first        : yes, unchanged
  validation runs second     : yes, unchanged
  values invented by coercion: 0
  orders defaulted           : 0
  same two steps in the same order, and nothing gets through
  the defect is not the order; it is that one step produces values the
  next step is designed to approve
```

```
a normalising step in front of a check
  makes the check simpler        yes, and that is why it is there
  narrows what the check sees    yes, necessarily
  can it manufacture a value the check accepts   this is the question
  and a default is exactly such a manufacture
```

```
the test for it is not a value; it is an ABSENCE
feed the pipeline a missing field and ask which layer first sees a number
```

Parsing once at the edge is why the validator can be three lines instead of thirty, and defaulting a missing quantity to 1 is friendlier than an error page for the most common value on the form. The validator has never accepted anything outside 1 to 999 and never will. 32400 orders a quarter ship a quantity of one that the customer never entered, and the validator was right about every one of them.

Verify it yourself:

```bash
pnpm eml run examples/the-validation-ran-on-the-value-after-it-was-coerced/the_validation_ran_on_the_value_after_it_was_coerced.eml
```
