# The page was server rendered and the price was client side

`the_page_was_server_rendered_and_the_price_was_client_side.eml` - The page is rendered on the server and arrives complete, which the performance work measured and confirmed. Where the price comes from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The server rendering is real and it was worth doing. The document arrives with its content, first contentful paint fell from two point one seconds to four hundred milliseconds, the page is readable with scripting disabled, and a crawler that runs no JavaScript sees every product. The measurements are on real devices rather than a simulated fast one.

One number on the page is not in that document. The price depends on the viewer's currency and their tier, so it is fetched after load and written into a placeholder — a decision made to keep the rendered page cacheable at the edge for everyone.

The placeholder is rendered, cached, and shown for four hundred milliseconds before the real number replaces it.

```
first contentful paint, before, ms : 2100
first contentful paint, after, ms  : 400
improvement, ms                    : 1700
views where the page did not render: 0
```

```
price fetch, ms                    : 410
page views per day                 : 4200000
hours a day showing a placeholder  : 478
share of the visible time before the price : 5061 per ten thousand
```

```
the server-rendered page
  document arrives with its content : yes
  readable with scripting disabled  : yes
  a crawler running no JavaScript sees every product : yes
  first contentful paint, ms        : 400, from 2100
  measured on                       : real devices, not a
    simulated fast one
  verdict                           : SERVER RENDERED
```

```
  the work was worth doing and the numbers are honest
```

```
the price
  depends on   : the viewer's currency and tier
  so it is     : fetched after load, into a placeholder
  why          : to keep one rendered page cacheable at the
    edge for every viewer
  that reason  : correct, and the cache hit rate depends
    on it
```

```
  the page is complete except for the number the page is
  about
```

```
the metrics, against the placeholder
  first contentful paint : fires at 400 ms
  largest contentful paint : fires on the image, earlier
    than the price
  a metric that waits for the price : none defined
  what the dashboards report : an improvement of 1700 ms
```

```
the crawler
  products found        : all of them
  price it reads        : the placeholder
  structured data block : rendered server-side, same value
  what a listing shows  : that value
```

```
null control - the price rendered, the cache varied on currency and tier
  first contentful paint, ms : 400, unchanged
  time until the price is visible, ms : 400
  hours a day showing a placeholder   : 0
  the rendering did not change; the cache key grew and
  the number the page is about arrived with the page
```

```
what server rendering guarantees
  the document arrives complete : exactly, for everything
    in the document
  the page is usable on arrival : not addressed; what was
    left out was left out for a cache key, and the metric
    that would notice is one nobody defines
```

```
a rendering strategy is measured by when pixels appear and
used to decide when a page is ready; the difference is
whichever field could not be shared, which is usually the
one the visit is for
```

The server rendering is real and worth it: content in the document, readable without scripting, every product visible to a crawler, first paint from 2100 to 400 ms on real devices. The price is fetched afterwards to keep one page cacheable for everyone, so it arrives 410 ms later - 5061 per ten thousand of the visible time - for 478 viewer-hours a day, and the crawler indexes the placeholder.

Verify it yourself:

```bash
pnpm eml run examples/the-page-was-server-rendered-and-the-price-was-client-side/the_page_was_server_rendered_and_the_price_was_client_side.eml
```
