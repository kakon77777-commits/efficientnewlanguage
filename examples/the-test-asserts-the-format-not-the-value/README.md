# The test asserts the format, not the value — 5 false alarms and 2 blind pairs

`the_test_asserts_the_format_not_the_value.eml` measures the two failure
directions of a rendered-output assertion separately, on the same function at
the same time.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: comparing the rendered string is the cheapest assertion
there is and looks like the strongest — it constrains everything the function
produces. It also constrains the rendering, which is a presentation decision
nobody promised to keep.

**Direction one — values differ, the string does not:**

```
pairs of records
  pairs compared        : 10
  pairs differing in value : 10
  the string separates  : 8
  the string cannot     : 2

the pairs the rendering hides
  [AB|C] and [A|BC] both render as ABC
  [XY|Z] and [X|YZ] both render as XYZ
```

**Direction two — the string differs, no value does:**

```
a rendering change, with every field left alone
  records            : 5
  string assertions that go red : 5
  values that changed           : 0
```

**The same two questions, asked of the fields:**

```
the same two questions, asked of the fields
  value-differing pairs it separates : 10 of 10
  red on the rendering change        : 0

The string assertion is both too strict and too loose, on the same
function, at the same time - 5 false alarms and 2 blind pairs.
```

**The control matters**, or the reader concludes that rendered comparisons are
always blind. They are blind exactly when the rendering loses a boundary:

```
control - the separated rendering, same comparison
  blind pairs : 0
  with a separator the rendering loses nothing, and the blindness is gone
```

An assertion answers a question about whatever it compares. Comparing the
output answers a question about the output.

Verify it yourself:

```bash
pnpm eml run examples/the-test-asserts-the-format-not-the-value/the_test_asserts_the_format_not_the_value.eml
```
