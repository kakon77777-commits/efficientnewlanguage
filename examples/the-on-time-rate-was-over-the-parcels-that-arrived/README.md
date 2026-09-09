# The on time rate was over the parcels that arrived

`the_on_time_rate_was_over_the_parcels_that_arrived.eml` - On-time delivery has been measured the same way for five years, from a scan taken at the customer's door, against a promise the customers themselves agreed. What a delivery is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is honest. The timestamp comes from the handheld scanned at the door rather than the driver's phone at the kerb; the promise is in the customer's local time, not the depot's; the definition was written with the customers and has not been changed to flatter a quarter; and it is audited quarterly against the carrier's own records.

A delivery exists when a parcel is scanned as delivered. A parcel that is lost is not a late delivery; it is not a delivery.

```
parcels accepted a month        : 2460000
  scanned as delivered          : 2431000
  inside the promise            : 2392000
  outside it                    : 39000
years measured the same way     : 5
quarterly audits passed         : 20
```

```
on time, over deliveries        : 9839 per ten thousand
on time, over acceptances       : 9723 per ten thousand
  distance between the two      : 116 per ten thousand
```

```
parcels that never became a delivery : 29000
  lost or destroyed             : 4100
  returned to sender            : 18600
  still in the network          : 6300
  in the denominator            : 0
```

```
the on-time measurement
  timestamp : the handheld scanned at the door, not the
    driver's phone at the kerb
  clock : the customer's local time, not the depot's
  definition : written with the customers, unchanged for
    5 years
  audits against the carrier's records : 20, all passed
  verdict : ON TIME
```

```
  scanning at the door rather than the kerb is the part
  almost nobody does, and it is why the 39000
  late deliveries are counted at all
```

```
what can appear in each place
  numerator : parcels scanned as delivered, inside the
    promise
  denominator : parcels scanned as delivered
  what creates a row : the delivery scan
  what a lost parcel contributes : nothing; it is not a
    late delivery, it is not a delivery
  parcels in that state : 29000
```

```
  the worst outcome the operation has is the one outcome
  the ratio cannot express
```

```
a parcel that never arrived
  was it accepted : yes, and paid for
  was it late : the question does not apply; there is no
    delivery to be late
  does it appear in the on-time figure : no
  does it appear anywhere : in claims, 4100 of them
  do the two numbers meet on a page : no
```

```
null control - measure against what was accepted
  audits passed : 20, unchanged
  denominator : 2460000 parcels accepted
  inside the promise : 2392000
  on time : 9723 per ten thousand
  nothing about the deliveries changed; the parcels that
  were never delivered were given a place to appear
```

```
what a high on-time rate guarantees
  a parcel that arrived, arrived on time : exactly,
    9839 per ten thousand of them, scanned at the door
  a parcel arrived : not addressed; a parcel that did
    not arrive never enters the ratio, in either place
```

```
a rate whose denominator is created by the event in its
numerator has a floor built into it; the failures that
matter most are the ones that never make a row
```

The timestamp is a door scan on the customer's clock, the definition was agreed with them and has stood for 5 years, and 20 audits have passed. A delivery exists when a parcel is scanned, so 29000 parcels a month are in neither place and the figure reads 9839 per ten thousand against 9723 over what was accepted - 116 apart.

Verify it yourself:

```bash
pnpm eml run examples/the-on-time-rate-was-over-the-parcels-that-arrived/the_on_time_rate_was_over_the_parcels_that_arrived.eml
```
