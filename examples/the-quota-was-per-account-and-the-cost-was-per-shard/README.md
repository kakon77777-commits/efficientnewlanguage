# The quota was per account and the cost was per shard

`the_quota_was_per_account_and_the_cost_was_per_shard.eml` - A shared cluster limits each account to a thousand queries an hour. No account has ever exceeded it. What a query costs the cluster is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Counting queries per account is the right shape for a fairness limit and it was chosen for good reasons. It is the unit the customer understands, the unit the contract is written in, and the only unit that can be counted at the edge without asking the storage layer anything. A limit that needs a round trip to evaluate is a limit that fails when the thing it protects is already in trouble.

A query is a request for an answer. The work is done by whichever shards hold the rows, and how many that is depends on the query, not on the account.

The counter is exact. It counts a thing that is not the thing being spent.

```
quota, per account per hour   : 1000 queries
cluster capacity              : 200000 shard-queries per hour
```

```
account   queries   fanout   shard-queries   quota used
  A         1000      1        1000           100 percent
  B         1000      64       64000          100 percent
```

```
  identical quota consumption
  cost ratio : 64 to 1
```

```
accounts the cluster can serve, all of them fully compliant
  if every account looks like A : 200
  if every account looks like B : 3 point 12
```

```
  the limit does not change between those two rows
  the number of customers the cluster can hold changes by 64 times,
  which is the cost ratio, because the capacity is the same capacity
```

```
accounts   fanout   shard-queries   capacity   violations
  1          64       64000          200000     0
  2          64       128000          200000     0
  3          64       192000          200000     0
  4          64       256000          200000     0
```

```
  the violations column is the one the quota system reports
  and it is correct at every row
```

```
what the quota counter can observe
  queries issued by an account : yes, exactly
  shards each query touched    : no, that is decided downstream
  cost of a query              : not represented in its unit
```

```
what the storage layer can observe
  shard-queries served         : yes, exactly
  which account they belong to : yes
  whether that account is over : it has no limit to compare against
```

```
  both halves are measured, in two places, in two units,
  and no line anywhere divides one by the other
```

```
control - is the quota system working
  accounts over their query limit : 0
  limit evaluations needing a round trip : 0
  false rejections : 0
  defects in the counter : 0
```

```
  the counter is exact and cheap, which is why it was chosen
```

```
null control - the same quota where fanout is always 1
  account A cost : 1000 shard-queries
  account B cost : 1000 shard-queries
  ratio          : 1 to 1
  accounts supported : 200, exactly
  same counter, same threshold, same enforcement
  the limit became a cost limit without being edited
```

```
a limit expressed in a unit that is not the scarce one
  is enforceable         : yes, and cheaply
  is fair between equals : yes, by its own unit
  bounds the resource    : only if the two units are proportional
  and nothing measures that proportion
```

```
the missing number is not a threshold, it is a conversion:
what one unit of the limit costs, and how much that varies
```

The quota is exact, cheap to evaluate at the edge, and 0 accounts have ever exceeded it. Two accounts both sitting at 1000 queries an hour spend 1000 and 64000 shard-queries respectively, a ratio of 64 to 1, so a cluster sized at 200000 shard-queries holds 200 of the first kind and 3 point 12 of the second, with the violation count reading 0 in both cases.

Verify it yourself:

```bash
pnpm eml run examples/the-quota-was-per-account-and-the-cost-was-per-shard/the_quota_was_per_account_and_the_cost_was_per_shard.eml
```
