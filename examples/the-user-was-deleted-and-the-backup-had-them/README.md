# The user was deleted and the backup had them

`the_user_was_deleted_and_the_backup_had_them.eml` - Erasure cascades across every table and a post-deletion probe confirms zero rows remain. Which stores the probe reads is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The erasure path is properly built. A request fans out across thirty-one tables in one transaction, it runs well inside the statutory deadline, and it does not stop at trusting the cascade: a separate probe re-queries every one of those tables for the subject identifier afterwards and asserts an empty result. Twelve thousand four hundred requests this year, all probed, all empty.

The probe reads the live database. The same rows also exist in daily backups, in quarterly archives, in the analytics warehouse loaded from a snapshot, and in a search index rebuilt from that warehouse.

The warehouse is queried by analysts every day.

```
tables in the cascade           : 31
erasure requests this year      : 12400
  probe confirmed empty         : 12400
rows remaining in the live database : 0
```

```
stores holding this data        : 66
  the live database             : 1
  daily backups                 : 35
  quarterly archives            : 28
  analytics warehouse           : 1
  search index                  : 1
stores the probe does not read  : 65
  share                         : 9848 per ten thousand
```

```
days until the last archive copy expires : 2555
analysts querying the warehouse daily    : 40
```

```
the deletion and its probe
  tables in the cascade : 31
  the cascade is trusted : no; a separate probe re-queries
  what the probe asserts : an empty result for the subject
    identifier, in every one of the 31 tables
  requests probed  : 12400 of 12400
  rows found       : 0
  verdict : ERASED
```

```
  re-querying rather than trusting the cascade is the step
  most implementations skip, and it is the right one
```

```
the probe
  connects to : the live database
  enumerates  : the 31 tables of the cascade
  where that list came from : the cascade it is checking
  what it proves : this database no longer holds the rows
  what a reader takes it for : that the data is gone
```

```
  the probe is complete over the store it connects to, and
  its table list is the deletion's own list, so it can only
  disagree with the cascade about execution, never about
  scope
```

```
the copies the probe does not read
  daily backups      : 35, each expiring on its own
  quarterly archives : 28, the last in 2555 days
  analytics warehouse: loaded from a snapshot, queried by
    40 analysts a day
  search index       : rebuilt from the warehouse
  of these, the ones that expire on their own : the backups
  of these, the ones a person reads : the warehouse and the
    index, today
```

```
what the compliance report counts
  requests completed in time : 12400
  requests verified by a probe : 12400
  stores enumerated : the deletion enumerates tables
  an inventory of stores holding personal data : exists,
    and nothing joins it to the deletion path
```

```
null control - the probe enumerates stores, not tables
  rows remaining in the live database : 0, unchanged
  stores the probe reads : 66
  stores it does not read : 0
  the deletion did not become more thorough; the probe
  stopped taking its list from the thing it was checking
```

```
what a verified erasure guarantees
  the live database no longer holds the subject : exactly,
    checked rather than assumed
  the subject is no longer held                 : not
    addressed; the probe names a connection, and the
    obligation names the data
```

```
a verification inherits the scope of the thing it verifies;
a probe built from the deletion's own table list can catch a
cascade that failed and can never catch a copy the cascade
was never told about
```

Erasure is verified rather than assumed: 31 tables cascaded, then re-queried by a separate probe that found 0 rows across all 12400 requests this year. The probe reads the live database, 1 of 66 stores holding the data, so 65 - 9848 per ten thousand - are unread, including archives that expire in 2555 days and a warehouse 40 analysts query today.

Verify it yourself:

```bash
pnpm eml run examples/the-user-was-deleted-and-the-backup-had-them/the_user_was_deleted_and_the_backup_had_them.eml
```
