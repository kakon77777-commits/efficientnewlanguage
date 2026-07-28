# Polymorphism without inheritance

`duck_typed_shapes.eml` dispatches `area()` across five unrelated classes.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a real EML-P limitation, and what you do about it.

`class Square(Shape):` is a **parse error** today — EML-P's class grammar
accepts a name and a colon, nothing else. There is no inheritance. That is
worth stating plainly in the corpus rather than leaving a reader to
discover it.

The answer is not "wait for inheritance", it is duck typing. Every class
here defines `area()` and `name()`; the loop calls them without knowing
which class it holds, and Python resolves the method on the object. The
loop is polymorphic even though the classes share no ancestor and no
declared interface.

```
  square(4)	area 16
  rect(3x5)	area 15
  triangle(6,4)	area 12.0
  square(1)	area 1
  point(2,2)	no area() - not a shape at all

Measured 4 shapes, skipped 1, total area 44.0
```

**What you give up** is the thing a base class would enforce: nothing
guarantees a shape *has* an `area()`. So the program checks it the way a
language without inheritance has to — by calling it and catching
`AttributeError`. The last entry is deliberately missing `area()`, and
the loop reports it rather than crashing.

That check is the point of the case. It is what a base class would have
given for free, written out by hand.

(The total prints as `44.0` rather than `44` because the triangle's area
comes from a division, and float spreads through the sum.)

Verify it yourself:

```bash
pnpm eml transpile examples/duck-typed-shapes/duck_typed_shapes.eml
pnpm eml run examples/duck-typed-shapes/duck_typed_shapes.eml         # -> 4 measured, 1 skipped
pnpm eml trace examples/duck-typed-shapes/duck_typed_shapes.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/duck-typed-shapes/duck_typed_shapes.eml   # -> OK (fixpoint)
```
