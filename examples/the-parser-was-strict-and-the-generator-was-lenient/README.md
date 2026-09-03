# The parser was strict and the generator was lenient

`the_parser_was_strict_and_the_generator_was_lenient.eml` - The parser rejects anything the specification does not require it to accept, deliberately. How many times that strictness has fired is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The strictness was chosen and defended. Accepting near-misses is how a format acquires an undocumented dialect that later becomes mandatory, so this parser refuses: no trailing commas, no duplicate keys, no implicit coercion, and a clear error naming the byte offset. The decision is right and the team has turned down two requests to loosen it.

Strictness on INPUT protects us from other people's output. The direction that decides whether other people can read US is the generator, and nothing argued about that one.

Every file this parser sees comes from that generator.

```
files parsed per day        : 2400000
rejections per day          : 0
```

```
third-party parsers tested  : 5
  accept our output         : 2
  reject our output         : 3
external consumers          : 1840
likely affected             : 1104
```

```
the parser
  trailing commas    : rejected
  duplicate keys     : rejected
  implicit coercion  : rejected
  error message      : names the byte offset
  requests to loosen it, declined : 2
  verdict            : STRICT
```

```
  refusing near-misses is how a format avoids acquiring an
  undocumented dialect, and that reasoning is sound
```

```
the population it guards
  files parsed per day : 2400000
  produced by our own generator : all of them
  produced by a third party     : none
  rejections           : 0
```

```
  the strictness has never fired, which is consistent with
  it working and with there being nothing for it to catch
```

```
share of tested parsers that reject us : 6000 per ten thousand
```

```
the round trip
  our generator to our parser : clean
  our generator to theirs     : 3 of 5 refuse
  the construct               : permitted by the spec,
    supported by few
  who tested the second row before a customer did : nobody
```

```
null control - the generator emits the common subset
  parser strictness   : unchanged, still strict
  parsers accepting our output : 5
  consumers affected  : 0
  the parser did not loosen; the generator stopped using
  a permission nobody else implements
```

```
what a strict parser guarantees
  we do not accept malformed input : exactly
  we do not emit unreadable output : not addressed, and
    the two are different directions with different
    counterparties
```

```
be strict in what you accept and conservative in what you
send is one sentence with two halves; a project can argue
the first half for years while the second is whatever the
library happened to do
```

The parser is strict on every axis and the strictness was defended twice: no trailing commas, no duplicate keys, no coercion, errors naming the byte offset. All 2400000 files a day come from our own generator, so it has fired 0 times, while that generator emits a spec-permitted construct 3 of 5 other parsers refuse - 6000 per ten thousand - reaching about 1104 external consumers.

Verify it yourself:

```bash
pnpm eml run examples/the-parser-was-strict-and-the-generator-was-lenient/the_parser_was_strict_and_the_generator_was_lenient.eml
```
