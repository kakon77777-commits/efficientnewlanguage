# The mask removed the value and kept the length

`the_mask_removed_the_value_and_kept_the_length.eml` - Customer names and email local parts are masked in the application log, one asterisk per character. How many customers the masked log still identifies uniquely is counted below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Masking character by character was a considered choice, not an oversight. It keeps log lines aligned so the columns stay readable, it lets an engineer see at a glance that a field was present rather than empty, and it makes a truncation or an encoding fault visible in the log without exposing anything. Replacing the value with a fixed token throws all of that away, and the people who asked for the per-character mask were right that they would lose it.

The review asked whether any log line contains a customer's name. It does not, on any line, and that check is run on every build and passes.

What the check cannot ask is whether the masked rendering is a function of the value, because that is not a question about the characters present. A mask that is one asterisk per character is exactly such a function: it publishes the length. Length is a small number of bits, and small numbers of bits add up across fields.

```
customers in the log : 20
distinct cities logged in the clear : 5
longest masked field in this data   : 12 characters
mask table covers                   : 16 characters
  headroom : 4, so no length is silently truncated
```

```
the log, as a reviewer reads it
  per character : ********  **********  Leeds
  fixed width   : ********  ********  Leeds
  per character : **  ***  Perth
  fixed width   : ********  ********  Perth
  per character : **********  ************  Ghent
  fixed width   : ********  ********  Ghent
  neither rendering contains a character of any name
  raw surnames found in the log by the build check : 0, under both masks
```

```
per-character mask
  customers identified uniquely : 13 of 20
  largest group anyone hides in : 3
```

```
control - fixed-width mask, same data
  customers identified uniquely : 0 of 20
  largest group anyone hides in : 5
  difference in unique identifications : 13
  difference in what the reviewer sees : none, both render every name as
  asterisks and both pass the raw-name check
```

```
what each field contributes when the mask follows the value
  city, logged in the clear : 5 distinct values
  surname length            : a number, published exactly
  local part length         : a number, published exactly
  the two lengths are not personal data on their own, which is why
  neither was reviewed, and the review is per field
```

```
the identification, one customer at a time
  Ghent, surname 10 characters, local part 12 characters
    customers matching that description : 1
    under a fixed-width mask            : 3
  Cork, surname 9 characters, local part 11 characters
    customers matching that description : 1
    under a fixed-width mask            : 4
  Perth, surname 2 characters, local part 3 characters
    customers matching that description : 1
    under a fixed-width mask            : 4
```

One asterisk per character keeps the columns aligned and shows a field was present, which is why it was chosen, and no log line contains a name under either mask. A mask that follows the value publishes the value's length: 13 of 20 customers are singled out by it, against 0 when the mask is a constant.

Verify it yourself:

```bash
pnpm eml run examples/the-mask-removed-the-value-and-kept-the-length/the_mask_removed_the_value_and_kept_the_length.eml
```
