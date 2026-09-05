# The callback was registered and the object was collected

`the_callback_was_registered_and_the_object_was_collected.eml` - The event registry is typed, tested, and delivers every event it dispatches with no recorded failures. What the delivery rate is a rate over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The registry is well built and the weak reference in it is not an oversight. An earlier version held subscribers strongly and leaked four point two gigabytes over a weekend, because a registration outlives the thing that made it more often than anyone expects. The weak reference was a deliberate fix, reviewed, and it ended the leak.

A weak reference lets the subscriber be collected. When the registry is the only thing pointing at a subscriber, the subscriber is unreachable by definition, so it goes, and its callback stops being called.

The delivery rate counts events delivered to live subscribers.

```
events dispatched               : 40000000
delivery failures recorded      : 0
events counted as undelivered   : 0
```

```
registrations                   : 2400
  held by something else        : 2210
  reachable only from the registry : 190
  of those, collected           : 190
  share                         : 791 per ten thousand
events a day they would have received : 26000
```

```
megabytes leaked by the earlier version : 4200
```

```
the event registry
  registration : typed, so a handler cannot mismatch its
    event
  delivery     : at least once to every live subscriber
  events dispatched : 40000000
  delivery failures : 0
  the weak reference : a reviewed fix for a real leak of
    4200 megabytes
  verdict : DELIVERED
```

```
  the weak reference solved the problem it was chosen for
  and it was the right problem to solve
```

```
the measurement
  numerator   : events delivered
  denominator : events dispatched to live subscribers
  what happens when a subscriber is collected : it leaves
    the denominator
  so a lost subscriber moves : both terms, together
  the rate after losing one : unchanged
```

```
  the failure and the count of opportunities are the same
  event, so no ratio built from them can move
```

```
which subscribers are collected
  held by a long-lived component : survives
  stored in a field by its owner : survives
  constructed, registered, and not otherwise kept : gone
  is that shape a mistake at the call site : it reads as
    correct, and it compiles
  registrations of that shape : 190
```

```
from inside the subscribing code
  registration returned successfully : yes
  an error at any point              : none
  events arriving                    : some, then none
  a log line at the moment it stops  : none, because
    nothing happened; an object became unreachable
  how it is usually found : someone notices a feature
    stopped working, weeks later
```

```
null control - a strong reference and an explicit handle
  delivery failures : 0, unchanged
  registrations collected while registered : 0
  megabytes leaked : 0, because unregistering is now a step
    a caller takes rather than a consequence it earns
  the registry did not get more reliable; the lifetime of a
  subscription stopped being inferred from reachability
```

```
what a perfect delivery rate guarantees
  every event reached every live subscriber : exactly, and
    over 40000000 events
  every subscriber received its events       : not
    addressed; a subscriber that is gone is not counted
    as a subscriber that was missed
```

```
a rate cannot see a failure that removes its own denominator;
the number to watch is not the ratio but the count of
registrations that stopped receiving, which requires
remembering that they existed
```

The registry is typed and delivers everything it dispatches - 40000000 events, 0 failures - and its weak reference was a reviewed fix for a real 4200 megabyte leak. A collected subscriber leaves the denominator with the event it missed, so 190 of 2400 registrations - 791 per ten thousand - stopped receiving 26000 events a day, counted as 0 undelivered.

Verify it yourself:

```bash
pnpm eml run examples/the-callback-was-registered-and-the-object-was-collected/the_callback_was_registered_and_the_object_was_collected.eml
```
