# Three copies and two places to lose them

`three_copies_and_two_places_to_lose_them.eml` - Every shard has three replicas, verified continuously, never fewer. How many shards survive the loss of one rack is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The placement policy spreads replicas across nodes in proportion to how many nodes each rack has, and that is the right way to balance load. It is not an approximation either: it puts exactly the same number of replicas on every node in the fleet, which is the best result available, and the alternative below is measurably worse at it.

The replication factor is also real. Three copies exist for every shard, the check that counts them runs continuously, and it has never once found a shard with two. Nobody is misreporting anything.

Three copies is a proxy. What it stands in for is three chances to lose the data independently, and independence is a property of where the copies are, not of how many there are. The racks are not the same size, so a policy that treats nodes as interchangeable will put two copies in the largest rack most of the time, and the count stays three the whole way.

```
nodes : 20 across 3 racks
replication factor : 3
distinct placements of one shard : 1140
one shard per placement, so every count below is exact
```

```
rack   nodes   shards with 0   with 1   with 2   with 3
  A      12      56              336      528      220
  B      4       560             480      96       4
  C      4       560             480      96       4
```

```
if one rack is lost, node-proportional placement
rack   shards below quorum   shards with no copy left   percent below quorum
  A      748                   220                        65
  B      100                   4                          8
  C      100                   4                          8
```

```
  losing rack A takes 748 of 1140 shards below quorum
  and destroys 220 of them outright
  no shard ever had fewer than three replicas at any point
```

```
control - one replica per rack
rack   shards below quorum   shards with no copy left
  A      0                     0
  B      0                     0
  C      0                     0
  every shard keeps two copies whichever rack is lost
  the replication factor is three under both policies, unchanged
```

```
control - what the continuous check measures
  shards with fewer than 3 replicas, node-proportional : 0
  shards with fewer than 3 replicas, one per rack      : 0
  the check is correct, it agrees with itself, and it cannot separate
  the two policies because the quantity it counts is the same in both
```

```
replicas per node, the reason the policy exists
rack   nodes   node-proportional   one per rack
  A      12      171                 95
  B      4       171                 285
  C      4       171                 285
  busiest node, node-proportional : 171
  busiest node, one per rack      : 285
  one replica per rack loads the busiest node 66 percent more heavily
  so the policy in place is not a mistake, it is the other half of a
  trade nobody wrote down as a trade
```

```
the arrangement that has neither cost
  racks of equal size : one replica per rack is also perfectly even
  racks as they are   : 12 nodes against 4 and 4
  the imbalance in the rack sizes is what makes the two goals disagree
  and the rack sizes were set by which cage had space in 2019
```

Balancing by node count puts exactly the same number of replicas on every node, and one per rack would load the busiest node 66 percent harder. Three copies is a proxy for three independent chances: losing rack A takes 748 of 1140 shards below quorum, with the replica count at three throughout.

Verify it yourself:

```bash
pnpm eml run examples/three-copies-and-two-places-to-lose-them/three_copies_and_two_places_to_lose_them.eml
```
