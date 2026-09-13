# The heartbeat stopped and the status stayed green

`the_heartbeat_stopped_and_the_status_stayed_green.eml` - The service status board has shown green for the whole shift, and every status it displayed was the one the service reported. What a stopped report displays as is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The health reporting is built carefully. The service pushes a heartbeat every ten seconds carrying its own self-check; the board shows the last status received; a status of anything but healthy turns the tile red; and the board is on the wall where everyone can see it.

The board shows the LAST heartbeat's status, and a stopped heartbeat sends nothing to replace it.

```
heartbeat interval              : 10 seconds
minutes since the last beat     : 47
  heartbeats expected since     : 282
  heartbeats received since     : 0
seconds the status has been stale : 2820
board status                    : green (last received)
tiles that go red on absence    : 0
```

```
the status board
  source : a heartbeat the service pushes every ten
    seconds, carrying its own self-check
  shows : the last status received
  on a non-healthy status : the tile turns red
  visibility : on the wall
  non-healthy statuses received : 0
  verdict : HEALTHY
```

```
  turning red on a reported fault is the part done right
  here, and it is why a sick service that still reports
  would show red
```

```
the beats that never arrived
  expected in the last 47 minutes : 
    282
  received : 0
  what the board does with no new status : keeps the
    last one
  what the last one was : green
  so absence displays as : the last health, held
    indefinitely
```

```
the service behind the green tile
  state : dead for 47 minutes
  what a dead service reports : nothing
  what nothing turns the tile : green, still
  the transition to red on silence : never defined
  is any displayed status wrong : no; each was really
    reported, once
  is the current display a current fact : no
```

```
null control - absence turns the tile red
  red tiles, absence holds green : 
    0
  red tiles, absence turns red : 
    1
  missing beats it would notice : 
    282
  no heartbeat changed; the board stopped treating no
  news as good news
```

```
what a green status board guarantees
  the last status the service reported was healthy :
    exactly, and a reported fault would turn it red
  the service is healthy : not addressed; the board shows
    the last heartbeat's status, and a stopped heartbeat is
    absence, not health - 282 expected beats, 0 received,
    still green
```

```
a display of the last report is a fact about the past, and health is a fact
about now; the two coincide only while the reports keep coming, and the moment
they stop is the moment the display means the least
```

The board shows the last pushed status and reddens on a reported fault - green all shift. It holds the last status when beats stop, so 47 minutes of silence - 282 expected beats, none received - display as green, under 0 tiles that redden on absence.

Verify it yourself:

```bash
pnpm eml run examples/the-heartbeat-stopped-and-the-status-stayed-green/the_heartbeat_stopped_and_the_status_stayed_green.eml
```
