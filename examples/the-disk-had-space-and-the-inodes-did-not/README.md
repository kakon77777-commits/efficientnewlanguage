# The disk had space and the inodes did not

`the_disk_had_space_and_the_inodes_did_not.eml` - The volume is thirty-eight percent free and the capacity dashboard is correct. Why writes are failing is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The capacity monitoring is not neglected. It samples every thirty seconds, it alerts at eighty percent and pages at ninety, it has a forecast that would have raised this six weeks before the volume filled, and it caught a runaway log last month at seventy-three percent. The number it reports is right.

A filesystem has two exhaustible resources and the dashboard watches one. Free bytes and free inodes are independent, and a workload of very small files consumes the second at a rate the first does not reveal.

The cache writes one file per key. The files average ten kilobytes and there are a hundred and twenty-two million of them.

```
capacity, bytes      : 2000000000000
used, bytes          : 1240000000000
free, bytes          : 760000000000
free, percent        : 38
```

```
inodes total         : 122000000
inodes used          : 122000000
inodes free          : 0
mean file size, bytes: 10163
```

```
the capacity monitor
  sample interval, seconds : 30
  warns at, percent used   : 80
  pages at, percent used   : 90
  currently used, percent  : 62
  forecast to full         : six weeks of headroom
  alerts fired             : 0
  verdict                  : HEALTHY
```

```
  it caught a runaway log last month at 73 percent; this
  is a working monitor reading a true number
```

```
the error the application sees
  errno            : ENOSPC
  message          : No space left on device
  free bytes       : 760000000000
  free inodes      : 0
  failing writes per minute : 4100
```

```
  the message names the resource the dashboard watches and
  the kernel means the other one
```

```
the two resources, in the same unit
  free bytes  : 3800 per ten thousand
  free inodes : 0 per ten thousand
```

```
  neither number can be computed from the other; the mean
  file size is their quotient and constrains neither
```

```
null control - one segment file per 4096 keys
  free bytes, percent : 38, unchanged
  inodes used         : 29785
  inodes free         : 121970215
  failing writes / min: 0
  the volume did not grow; the workload stopped spending
  the resource nobody was counting
```

```
what free space guarantees
  bytes can still be written : exactly
  a write will succeed        : not addressed; a write
    needs a byte AND an entry, and a monitor that watches
    one of two exhaustible resources is green until the
    other one is gone
```

```
'is there room' is two questions on any filesystem; the error
message uses one word for both, which is why the dashboard
and the kernel can each be right
```

The volume is 38 percent free and the capacity monitor is right to be green: it samples every 30 seconds, warns at 80, forecasts six weeks of headroom and caught a runaway log last month. Writes fail ENOSPC 4100 times a minute because the other exhaustible resource is at 0 free of 122000000 - 0 per ten thousand against 3800 for bytes - spent by a cache averaging 10163 bytes a file.

Verify it yourself:

```bash
pnpm eml run examples/the-disk-had-space-and-the-inodes-did-not/the_disk_had_space_and_the_inodes_did_not.eml
```
