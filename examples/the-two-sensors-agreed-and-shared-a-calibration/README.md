# The two sensors agreed and shared a calibration

`the_two_sensors_agreed_and_shared_a_calibration.eml` - The two pressure sensors have agreed within one unit all year, and the agreement is real. What they were zeroed against is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The redundancy is designed well. There are two independent sensors, not one; they are read on separate channels; a disagreement beyond a threshold raises an alarm; and the readings are logged side by side.

Both were zeroed against the same reference block at install.

```
sensor A                        : 1012 mbar
sensor B                        : 1012 mbar
  disagreement                  : 0 mbar
  alarm threshold               : 2 mbar
```

```
shared reference drift          : 7 mbar
true pressure                   : 1005 mbar
error both sensors share        : 7 mbar
independent references          : 1
```

```
the two-sensor check
  sensors : two, not one
  channels : separate
  on a disagreement past two mbar : alarm
  logging : side by side
  the disagreement seen : 0 mbar
  verdict : SENSORS AGREE
```

```
  separate channels are the part done right here, and
  they are why a single wiring fault cannot fake agreement
```

```
the calibration behind both
  what each was zeroed against : one reference block
  when : at install, together
  what the block has since done : drifted by seven mbar
  so both sensors : carry the same seven-mbar offset
  what their agreement proves : that they share it, not
    that either is right
```

```
the pressure in the vessel
  what both sensors read : 1012 mbar
  what it truly was : 1005 mbar
  the shared error : 7 mbar, above the alarm
    threshold, but identical so unalarmed
  did a sensor fail : no; both are working and agree
  what agreement could not catch : an error in the thing
    both were measured against
```

```
null control - one sensor on an independent reference
  disagreement with a shared calibration : 
    0 mbar, unchanged
  disagreement with an independent one : 
    7 mbar
  alarms it would raise : 1
  no sensor changed; one stopped sharing the reference
  the other drifts with
```

```
what two agreeing sensors guarantee
  the two independent channels read the same value :
    exactly, within one mbar, alarm armed past two
  the reading is accurate : not addressed; both sensors
    were zeroed against the same reference, so they share
    its 7-mbar drift and agree at the wrong value
```

```
redundancy catches a fault that is independent between the copies; a fault in
what they were both calibrated against is common to both, and agreement is
exactly what it produces
```

Two sensors, separate channels, alarm past two mbar - agreed within one all year. Both were zeroed against one reference block, which has drifted 7 mbar, so they agree at 1012 while the vessel is at 1005, a shared error above the threshold under 1 independent reference.

Verify it yourself:

```bash
pnpm eml run examples/the-two-sensors-agreed-and-shared-a-calibration/the_two_sensors_agreed_and_shared_a_calibration.eml
```
