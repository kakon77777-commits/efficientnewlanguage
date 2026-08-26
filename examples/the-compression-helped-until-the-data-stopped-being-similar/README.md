# The compression helped until the data stopped being similar

`the_compression_helped_until_the_data_stopped_being_similar.eml` - The archive ingests 1000 GB a month, every month, and has done for a year. What it stores is computed below, along with the capacity forecast that was written in month 1.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Forecasting from the measured compression ratio is the right method and was done carefully. The ratio was not assumed, it was measured over a full month of real traffic. It was re-measured in month 2 and month 3 and came back the same both times. Three consistent measurements is more diligence than most forecasts get, and the number that came out - 7.4 to 1 - was correct.

A blended compression ratio is not an average of the ratios. It is a weighted harmonic mean, which is dominated by its worst term. A class that does not compress contributes its bytes at full size no matter how small its share of the input is, so it occupies a share of the OUTPUT far larger than its share of the input, from the very first day.

In month 1 the incompressible class was 5 percent of what came in and 37 percent of what was kept. Nobody looked at the second number.

```
intake is 1000 GB per month and has never changed
```

```
month 1
class    ratio   intake GB   share of intake   stored GB
  logs     20:1     700           70 pct          35
  json     5:1     250           25 pct          50
  media     1:1     50           5 pct          50
  total stored: 135 GB
  blended ratio: 740 hundredths to 1
```

```
  the same month, read by share of what was KEPT
    logs is 70 pct of intake and 25 pct of storage
    json is 25 pct of intake and 37 pct of storage
    media is 5 pct of intake and 37 pct of storage
```

```
month 12, after the mix moved
class    ratio   intake GB   share of intake   stored GB
  logs     20:1     400           40 pct          20
  json     5:1     250           25 pct          50
  media     1:1     350           35 pct          350
  total stored: 420 GB
  blended ratio: 238 hundredths to 1
```

```
  the same month, read by share of what was KEPT
    logs is 40 pct of intake and 4 pct of storage
    json is 25 pct of intake and 11 pct of storage
    media is 35 pct of intake and 83 pct of storage
```

```
intake  : 1000 GB in month 1 and 1000 GB in month 12, unchanged
stored  : 135 GB in month 1 and 420 GB in month 12
that is a factor of 31 tenths, from an intake that did not move
```

```
capacity           : 5000 GB
forecast in month 1: 37 months of headroom
rate in month 12   : 11 months of headroom
the forecast was arithmetic on a correctly measured number
```

```
the mechanism, stated as arithmetic
  a class at ratio r contributes intake_share / r to the output
  at r = 1 the division does nothing, so it contributes in full
  every other class is divided down, so it contributes less than its share
  therefore the r = 1 class always occupies MORE of the output than the input
  the multiplier is the blended ratio itself
  month 1: media was 5 pct of intake and 37 pct of storage
  the ratio between those two numbers is 740 hundredths
  the blended ratio in month 1 was 740 hundredths
  they are the same number, and they are the same number by construction
```

```
control - the quantity that did not change
  intake month 1  : 1000 GB
  intake month 12 : 1000 GB
  difference      : 0 GB
  the ingest graph was flat for twelve months and was read as reassuring
```

```
null control - a 30 point mix shift between two equally compressible classes
  stored before : 97 GB
  stored after  : 97 GB
  difference    : 0 GB
  30 points moved and the output did not, because both terms divide by 20
```

The ratio was measured over a full month of real traffic and re-measured twice more, which is why nobody doubted it. It was a true statement about a mix, and it was read as a true statement about the archive. Intake never moved off 1000 GB a month. Storage went from 135 to 420 GB a month, and the headroom went from 37 months to 11.

Verify it yourself:

```bash
pnpm eml run examples/the-compression-helped-until-the-data-stopped-being-similar/the_compression_helped_until_the_data_stopped_being_similar.eml
```
