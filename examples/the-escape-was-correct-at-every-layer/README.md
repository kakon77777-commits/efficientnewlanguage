# The escape was correct at every layer

`the_escape_was_correct_at_every_layer.eml` - Customer names are escaped when they arrive and escaped again when they are rendered. What each output route shows is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both escapes are right, individually and by the same rule. The template engine escapes on output, which is the thing that stops a name from becoming markup, and turning it off is how sites get attacked. The ingress escape was added after an incident in which a value reached a consumer that did no escaping of its own, and defence in depth is the standard response to that. Two people applied the same correct rule at the two places the rule names.

Escaping is not idempotent. Applying it twice is not the same as applying it once, because the escape sequence it produces is itself made of characters that the escape wants to encode. Validation composes: check twice and you have checked. Normalisation composes. Escaping does not, and the rule "escape at the boundary" is only safe when a boundary can be named and counted.

There is no place in the code where anyone can see two of them at once. The ingress layer and the template are different files owned by different teams, and each is correct when read on its own.

```
the stored value
  as typed by the customer : Ben & Jerry's
  length                   : 13
  after the ingress escape : Ben &amp; Jerry&#39;s
  length                   : 21
```

```
escaping applied n times to the same value
  n=0   length 13    Ben & Jerry's
  n=1   length 21    Ben &amp; Jerry&#39;s
  n=2   length 29    Ben &amp;amp; Jerry&amp;#39;s
  n=3   length 37    Ben &amp;amp;amp; Jerry&amp;amp;#39;s
```

```
  each extra layer adds 8 characters, so the layer count is recoverable
  from the length alone, which is how this was eventually found
```

```
route                  total escapes   needs   renders as
  web page               2               1       Ben &amp;amp; Jerry&amp;#39;s
  json api               1               0       Ben &amp; Jerry&#39;s
  csv export             1               0       Ben &amp; Jerry&#39;s
  transactional email    3               1       Ben &amp;amp;amp; Jerry&amp;amp;#39;s
  pdf invoice            1               0       Ben &amp; Jerry&#39;s
```

```
  routes rendering the customer's name correctly : 0 of 5
  every route applies exactly the number of escapes its own code says,
  and the stored value already carries one that none of them can see
```

```
control - the same value written by a job that skips the ingress layer
  web page               renders Ben &amp; Jerry&#39;s
  json api               renders Ben & Jerry's
  correct on the html route and correct on the json route
  so the escape function is right and the templates are right
```

```
control - customers whose rendering changes at all
  customers            : 10
  containing an escapable character : 5
  unaffected                        : 5
  for those, one escape and three escapes give the same string, so a
  test written with any of them passes under every layer count
```

```
which names a test would be written with
  Alice Chen           n=1 Alice Chen               n=3 Alice Chen
  Ben & Jerry's        n=1 Ben &amp; Jerry&#39;s    n=3 Ben &amp;amp;amp; Jerry&amp;amp;#39;s
```

```
operations at a boundary, and whether two of them are worse than one
  validate  : idempotent, two checks are one check
  normalise : idempotent by definition, that is what it means
  escape    : not idempotent, its output is made of the characters it
              encodes, so it has nothing to be idempotent about
  the rule that was followed does not distinguish these three
```

Escaping on output stops a name becoming markup and escaping on ingress was added after a real incident. Escaping is not idempotent, so the two correct rules give 5 of 5 routes a wrong rendering, and 5 of 10 customers have a name that looks identical however many times it is escaped.

Verify it yourself:

```bash
pnpm eml run examples/the-escape-was-correct-at-every-layer/the_escape_was_correct_at_every_layer.eml
```
