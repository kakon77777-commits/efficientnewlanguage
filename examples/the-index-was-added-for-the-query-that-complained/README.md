# The index was added for the query that complained

`the_index_was_added_for_the_query_that_complained.eml` - Nine indexes, each added after somebody reported a slow query. What they cost and what they save is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding an index when a query is reported slow is right and it works. The report names a real query, the index makes it fast, and the person who reported it confirms the fix. Every one of these was a correct response to a correct observation.

An index is paid for on every write to the table, by everybody. A report is made by whoever is blocked enough to write one. So the indexes accumulate where the complaints are, and the write cost accumulates on the tables, and those are two different distributions.

Both are computed per index.

```
indexes : 9, every one added after a report
ms saved on reads per day : 2716395
ms added to writes per day: 1589600
  net : 1126795 ms a day better
```

```
index              saves/day   costs/day   net
  orders_status   36000        36000      +0
  orders_created   10000        36000      -26000
  orders_customer   900000        36000      +864000
  events_type   2400        360000      -357600
  events_actor   6300        360000      -353700
  events_session   720        360000      -359280
  users_email   1760000        1600      +1758400
  audit_actor   600        200000      -199400
  audit_target   375        200000      -199625
```

```
indexes that cost more than they save : 6 of 9
```

```
the 5 that cost more than 100000 ms a day net
  events_type : 200 reads a day against 90000 writes
  events_actor : 350 reads a day against 90000 writes
  events_session : 80 reads a day against 90000 writes
  audit_actor : 40 reads a day against 40000 writes
  audit_target : 25 reads a day against 40000 writes
  each of these serves a low-traffic read on a high-traffic table, which is
  exactly the shape a person notices - the query is slow BECAUSE it is rare
  enough to miss the cache
```

```
indexes added on a report : 9 of 9
indexes added on measured cost : 0
  none, so the entire index set is a record of who complained
```

```
the same nine, ordered by net benefit
  worth keeping : 3
  worth dropping: 6
  write time recovered by dropping them : 1495605 ms a day
  and the 6 reports that produced them were all correct about their query
```

```
what the reporter of a dropped index experiences
  events_type : their query goes back to +12 ms, 200 times a day
  events_actor : their query goes back to +18 ms, 350 times a day
  events_session : their query goes back to +9 ms, 80 times a day
  that is a real regression for a real person, and it is the cost of the
  write time everybody else is paying
```

```
control - orders_customer, 15000 reads against 12000 writes
  saves 900000, costs 36000, net +864000
  here the complaint-driven method and a cost-driven one agree, and
  most indexes are like this - which is why the method is trusted
control - users_email, 22000 reads against 800 writes
  saves 1760000, costs 1600, net +1758400
  here the complaint-driven method and a cost-driven one agree, and
  most indexes are like this - which is why the method is trusted
```

Every index was a correct response to a real report, and the reporter confirmed the fix each time. A report is made by someone blocked; the write cost is paid by everybody, and nobody is blocked enough by three milliseconds to write it up.

Verify it yourself:

```bash
pnpm eml run examples/the-index-was-added-for-the-query-that-complained/the_index_was_added_for_the_query_that_complained.eml
```
