# The average speed was the mean of the legs

`the_average_speed_was_the_mean_of_the_legs.eml` - The trip was 30 km/h out and 60 km/h back over the same road, and both speeds are measured correctly. What the average over the whole trip is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Each leg's speed is honest. The distance is the same both ways; each speed is distance over the time that leg actually took; neither leg is estimated; and the odometer and clock agree at both ends.

The reported average is the mean of the two leg speeds.

```
leg distance                    : 60 km each way
speed out                       : 30 km/h
speed back                      : 60 km/h
reported average (mean of legs) : 45 km/h
```

```
time out                        : 120 minutes
time back                       : 60 minutes
total time                      : 180 minutes
total distance                  : 120 km
true average                    : 40 km/h
  overstatement                 : 5 km/h
```

```
the two leg speeds
  distance : the same road, both ways
  each speed : distance over the time that leg took
  either leg estimated : no
  odometer and clock : agree at both ends
  legs measured correctly : both
  verdict : EACH LEG CORRECT
```

```
  timing each leg from the same clock at both ends is the
  part done right here, and it is why neither speed is in
  question
```

```
the mean of the two speeds
  what it averages over : trips, one weight each
  what speed averages over : time, and the legs took
    unequal time
  time on the slow leg : 120 minutes
  time on the fast leg : 60 minutes
  so the slow speed should count : twice as much, not
    equally
  the mean gives them : equal weight, and overstates
```

```
the trip end to end
  distance covered : 120 km
  time taken : 180 minutes
  distance over time : 40 km/h
  the reported figure : 45 km/h
  is either leg speed wrong : no; the combining is
```

```
null control - total distance over total time
  mean of the speeds : 45, unchanged
  distance over time : 40 km/h
  leg speeds changed : 0
  no distance and no time changed; the average stopped
  being taken over trips and started being taken over the
  minutes actually spent
```

```
what two correct leg speeds guarantee
  each leg's speed is distance over its own time :
    exactly, same road, clock agreed at both ends
  the average speed is their mean : not addressed; speed
    averages over time not over trips, and equal distances
    at 30 and 60 spend twice as long on the slow leg - the
    true average over 120 km in 180 minutes is 40
```

```
an average is weighted by whatever it ranges over, and speed ranges over time;
giving two legs equal weight when one took twice as long counts the fast leg as
if it lasted as long as the slow one
```

Both leg speeds are exact, same road, clock agreed at both ends. The average is their mean, but speed averages over time - the slow leg took 120 minutes to the fast leg's 60 - so 120 km in 180 minutes is 40 km/h, not the reported 45.

Verify it yourself:

```bash
pnpm eml run examples/the-average-speed-was-the-mean-of-the-legs/the_average_speed_was_the_mean_of_the_legs.eml
```
