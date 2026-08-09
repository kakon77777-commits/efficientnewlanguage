# Attribution window picks the winner — same model, same data, decided by a number in a config file

`attribution_window_picks_the_winner.eml` holds last-touch attribution fixed
and sweeps only the lookback window, reporting per-channel credit, the winner,
and how many conversions end up attributed to nobody.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: 7-day last-touch and 30-day last-touch are the same
model. The window changes for reasons that have nothing to do with causality —
how much history the warehouse keeps, what the vendor defaults to, what the
query can afford.

| window | brand | social | email | search | attributed | dropped | winner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0 | 0 | 3 | 3 | 5 | **search** |
| 3 | 0 | 0 | 0 | 3 | 3 | 5 | **search** |
| 7 | 0 | 0 | 0 | 3 | 3 | 5 | **search** |
| 14 | 0 | 0 | 4 | 3 | 7 | 1 | **email** |
| 30 | 1 | 0 | 4 | 3 | 8 | 0 | **email** |

Attributed plus dropped equals the conversion count at every window, so nothing
goes missing without being counted as missing. And the unattributed share is
the row worth staring at:

```
window 7    unattributed: 5 of 8 (62.5%)
window 30   unattributed: 0 of 8 (0.0%)
```

At a 7-day window, **62.5% of conversions get no credit at all** — and the
dashboard shows the remaining 37.5% as though it were the whole picture.

The timing that produces the direction, read off the data rather than the
channel names:

```
brand    appears 5 times, on average 19.4 days before the conversion
social   appears 5 times, on average 15.6 days before the conversion
email    appears 6 times, on average  8.3 days before the conversion
search   appears 3 times, on average  0.3 days before the conversion
```

**Two wrong premises, kept in the file.** The first data set never flipped the
winner at all — `search` dominated at every window, so the case was
demonstrating nothing. And the direction check asserted that the late channel
*gains* from a short window in absolute terms; measured, it loses (4 against 5).
Shortening a window drops touches from every channel, late ones included, so
absolute credit is non-increasing for everybody. What a short window
redistributes is the **share** of whatever remains attributable — and the share
is what a dashboard shows.

Verify it yourself:

```bash
pnpm eml run examples/attribution-window-picks-the-winner/attribution_window_picks_the_winner.eml
```
