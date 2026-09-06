# The cache was keyed on the url and the header varied the answer

`the_cache_was_keyed_on_the_url_and_the_header_varied_the_answer.eml` - The cache key is the full URL with query parameters sorted and allowlisted, the hit rate is ninety-four percent, and purges on deploy are verified. What the key omits is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The cache key was designed rather than defaulted. Query parameters are sorted so two orderings of the same request share an entry; only six parameters are allowlisted, so tracking parameters cannot fragment the cache into millions of single-use entries; and the purge that runs on deploy is verified by refetching rather than assumed. The hit rate is ninety-four percent and the origin load reflects it.

The key is built from the URL. Three request headers change the body the origin produces, none of them appears in the key, and the origin sets no Vary, so the first response to arrive is served to everyone.

Two point one million responses a day depend on one of those headers.

```
responses per day               : 84000000
  served from cache             : 78960000
  hit rate                      : 9400 per ten thousand
```

```
query parameters allowlisted    : 6
key orderings after sorting     : 1
headers the body depends on     : 3
  in the cache key              : 0
  declared by a Vary            : 0
```

```
responses depending on such a header : 2100000
  that happened to match        : 1790000
  built for another value       : 310000
  share of all responses        : 36 per ten thousand
```

```
the cache key
  query parameters : sorted, so one request has
    1 key rather than one per ordering
  parameters allowlisted : 6, so tracking parameters
    cannot fragment the cache
  purge on deploy : verified by refetching, not assumed
  hit rate : 9400 per ten thousand
  verdict : KEYED
```

```
  an allowlist rather than a denylist is the choice that
  keeps this hit rate, and it was made on purpose
```

```
the inputs to the key
  the path            : in the key
  allowlisted query   : in the key
  everything else in the query : deliberately excluded,
    and correctly
  the headers         : 0 of 3 that change the body
  who would declare that dependency : the origin, with a
    Vary header
  Vary headers it sets : 0
```

```
  the key is a complete description of the URL and the
  response is not a function of the URL alone
```

```
the ones that match
  responses depending on a header : 2100000
  of those, matching by coincidence : 1790000
  why : whichever value populated the entry is the
    common one, and most requests carry it
  what that makes the wrong ones look like : a handful of
    unrelated reports
  what they are : 310000 a day
```

```
one hit
  the claim : this stored response is the response the
    origin would produce for this request
  what makes that true : the request and the stored one
    agree on everything the origin reads
  what the cache compares : the key
  what the origin reads : the key, plus 3 headers
  who is supposed to close that gap : the origin, by
    declaring Vary
```

```
the hit rate
  what it measures : entries found
  what a wrong-variant response is : an entry found
  so its effect on the rate : raises it
  hit rate now : 9400 per ten thousand
  a correctness metric on variants : none defined
```

```
null control - Vary is declared and the key includes it
  headers in the key : 3
  wrong-variant responses : 0
  hit rate : 8900 per ten thousand, down from 9400
  the cache did not get worse; the number went down
  because it had been counting responses that were found
  and wrong
```

```
what a well-designed cache key guarantees
  two requests with the same key get the same response :
    exactly, and the key was designed so that the right
    requests share one
  a cached response is the right response : not
    addressed; that holds when the key names everything
    the answer depends on, which is a fact about the
    origin, not about the key
```

```
a cache is a memo table for a function, so its correctness
is a claim about the function's arguments; a key that is
carefully complete over the URL is complete over the URL
```

The key is designed rather than defaulted: parameters sorted to 1 ordering, only 6 allowlisted so tracking cannot fragment it, purges verified by refetching, and a 9400 per ten thousand hit rate. It is built from the URL while 3 headers change the body, with 0 in the key and 0 Vary declared, so 310000 responses a day - 36 per ten thousand - are hits built for someone else.

Verify it yourself:

```bash
pnpm eml run examples/the-cache-was-keyed-on-the-url-and-the-header-varied-the-answer/the_cache_was_keyed_on_the_url_and_the_header_varied_the_answer.eml
```
