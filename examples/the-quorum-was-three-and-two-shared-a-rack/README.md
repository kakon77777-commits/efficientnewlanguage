# The quorum was three and two shared a rack

`the_quorum_was_three_and_two_shared_a_rack.eml` - Every shard has three replicas on three distinct nodes and needs two to serve. The placement check passes on all of them. What a single rack failure removes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Three replicas with a quorum of two is the right configuration and the placement rule is enforced, not aspirational: the scheduler refuses to put two replicas of a shard on one node, and a background auditor re-checks every shard continuously. Distinct nodes is a real property and it is real here.

A quorum tolerates failures that are independent. Nodes in one rack share a power feed and a switch, so they do not fail independently — they fail together, and "together" is exactly the case a quorum is sized against.

The placement rule counts nodes. Failures arrive by rack.

```
shards                   : 4096
replicas per shard       : 3
quorum                   : 2
racks                    : 48
```

```
the placement rule, checked on every shard
  shards with 3 replicas          : 4096 of 4096
  shards with two on one node   : 0
  scheduler violations          : 0
  auditor findings              : 0
  defects in the placement rule : 0
```

```
  distinct NODES is true of every shard in the cluster
```

```
the same shards, counted by rack
  spread across three racks     : 2916
  two replicas in one rack      : 1180
  share                         : 2880 per ten thousand
```

```
  no rule was broken to produce that column
  it was never a rule
```

```
one rack fails
  shards losing one replica  : 60, still have 2, still serving
  shards losing two replicas : 24, below quorum, unavailable
```

```
  the second row is the one the configuration was chosen to
  make empty, and it is the one the placement rule cannot see
```

```
instrument                 reads
  replica count            3 on every shard
  distinct nodes           enforced, 0 violations
  under-replicated shards  0
  shards below quorum      0
  shards that WOULD be, per rack   not measured
```

```
  the first four are green and each of them is true
```

```
rack   shards losing 1   shards losing 2   unavailable
  1      60               24                yes
  2      60               24                yes
  3      60               24                yes
  4      60               24                yes
```

```
  every rack has the same exposure, because the placement
  was uniform with respect to the property it optimised
```

```
control - is the node rule earning its place
  shards a single NODE could take below quorum : 0
  scheduler placements refused for this reason : enforced continuously
  auditor disagreements with the scheduler     : 0
  defects in the rule                          : 0
```

```
  the rule is correct, enforced, and audited
  it is about the wrong unit of failure
```

```
null control - the same configuration placed by rack
  replicas per shard        : 3, unchanged
  quorum                    : 2, unchanged
  two replicas in one rack  : 0
  shards below quorum after one rack fails : 0
  the redundancy did not increase
  the domain it is measured over did
```

```
what distinct replicas guarantees
  they are separate copies       : yes
  they fail separately           : only in the domain you named
  and the domain that matters is the one failures arrive in,
  which is decided by power, network and cooling rather than
  by the scheduler's data model
```

```
the number to publish is not the replication factor, it is
the count of shards that lose quorum to one failure of each
kind - node, rack, zone - because those are three different
numbers and only the first one is being checked
```

The scheduler enforces three replicas on three distinct nodes on all 4096 shards, with 0 violations and 0 auditor findings, and no single node can take any shard below quorum. Counted by rack, 1180 shards - 2880 per ten thousand - hold two replicas in one rack, so one rack failure takes 24 shards below quorum while every green indicator above stays green.

Verify it yourself:

```bash
pnpm eml run examples/the-quorum-was-three-and-two-shared-a-rack/the_quorum_was_three_and_two_shared_a_rack.eml
```
