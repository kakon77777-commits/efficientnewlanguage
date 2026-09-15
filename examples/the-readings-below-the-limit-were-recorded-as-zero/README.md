# The readings below the limit were recorded as zero

`the_readings_below_the_limit_were_recorded_as_zero.eml` - A water-quality report gives the average contaminant level, and it averages the real recorded readings of every sample correctly. What a recorded zero means is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It reads the real assay values, not estimates; it covers every sample; the mean is the honest average of the recorded levels; and the intent is exactly 'the average contaminant concentration'.

The assay cannot quantify below 5 units, so every below-limit reading is stored as 0 - and a stored 0 means 'below the limit', not 'none present'.

```
samples                         : 40000
  above the detection limit     : 10000
  below the limit, stored as 0  : 30000
```

```
mean, below-limit read as zero  : 8
mean, below-limit at half-limit : 10
level the floor hid             : 2
understated share of the truth  : 2000 per ten thousand
```

```
the contaminant average
  reads : the real assay values, not estimates
  covers : every sample
  mean : the honest average of the recorded levels
  intent : the average contaminant concentration
  samples omitted : 0
  verdict : RECORDED MEAN IS 8, COMPUTED CORRECTLY
```

```
  averaging the real recorded values over every sample is
  the part done right here, and it is why 8 is the correct
  mean of what was stored
```

```
the stored zero
  the assay's limit : it cannot quantify below 5 units
  what a below-limit reading becomes : 0
  what that 0 means : below the limit, somewhere in 0 to 5
  what it is read as : none present, exactly zero
  so the mean : treats a floor as a true absence, on 30000
    of the 40000 samples
```

```
the result of the report
  reported average : 8
  average if below-limit is half the limit : 10
  concentration hidden by the floor : 2
  is the recorded mean wrong : no; 8 is exact for the
    stored values
  is a stored 0 an absence : no; it is a value censored at
    the detection limit and read as zero
```

```
null control - substitute half the limit for below-limit readings
  mean with a hard zero : 8
  mean with half-limit substitution : 10
  readings no longer read as absent : 30000
  no sample and no assay reading changed; the below-limit
  values stopped being read as zero and started being read
  as somewhere under the limit
```

```
what an average of the recorded readings guarantees
  it is the correct mean of what was stored : exactly, real
    values, every sample, honest average
  it is the average concentration present : not addressed;
    the assay floors sub-limit readings to 0 and a 0 is read
    as absence, so the 30000 censored samples pull the mean to 8
```

```
a detection limit is a floor on what can be seen, not on what is there; storing
the unseen as zero turns 'too small to measure' into 'measured as nothing', and
an average built on that reads a limit of the instrument as a value of the world
```

It averages the real recorded values over every sample - 8 is the exact recorded mean. But the assay stores every below-limit reading as 0 and a 0 is read as absent; the 30000 censored samples give a true mean nearer 10, 2000 per ten thousand understated, until the floor is estimated instead of zeroed.

Verify it yourself:

```bash
pnpm eml run examples/the-readings-below-the-limit-were-recorded-as-zero/the_readings_below_the_limit_were_recorded_as_zero.eml
```
