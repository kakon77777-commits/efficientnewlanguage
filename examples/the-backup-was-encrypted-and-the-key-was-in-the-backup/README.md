# The backup was encrypted and the key was in the backup

`the_backup_was_encrypted_and_the_key_was_in_the_backup.eml` - Every backup is encrypted at rest and the restore drill passes quarterly. What an archive contains is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The encryption is correct. A modern authenticated cipher, keys in a managed service with per-role access, no key ever written to the repository, and a restore drill four times a year that has never needed a manual step. Ninety archives, all encrypted, none with a weak or reused key.

The archive is a full filesystem snapshot of the application host. That host must start unattended after a reboot, so the key material it needs is on its own disk — which is inside the thing being snapshotted.

The backup is encrypted with a key the backup contains.

```
backups retained            : 90
encrypted                   : 90
offsite copies of each      : 3
archive copies offsite      : 270
key material files per backup : 1
copies of the key in the archives : 90
```

```
the encryption posture
  cipher              : authenticated, modern
  key storage         : managed service, per-role access
  keys in the repository : none
  weak or reused keys : none
  archives encrypted  : 90 of 90
  verdict             : ENCRYPTED AT REST
```

```
  none of that is nominal; the key service is real and the
  access controls on it are enforced
```

```
the quarterly restore drill
  drills per year       : 4
  needing a manual step : 0
  what it proves        : the archive is complete and the
    restore procedure works unattended
```

```
  the second half of that is the finding: unattended means
  the key was available without a person, and the drill
  runs on a host restored from the archive
```

```
an attacker holding one archive
  ciphertext           : present
  key material         : present, on the same disk image
  additional access needed : none
  the key service is consulted : not during a restore from
    this image, which is why the drill needs no operator
```

```
key copies per archive : 10000 per ten thousand, which is one each
```

```
the audit's questions
  are backups encrypted        : yes, 90 of 90
  are keys held outside the data : yes, in the key service
  do the archives contain a copy of the key : not asked
  who would ask it : nobody owns both inventories
```

```
null control - the key path excluded from the snapshot
  archives encrypted      : 90, unchanged
  copies of the key in the archives : 0
  drills needing a key fetch : 1
  the cipher did not change; the restore stopped being
  able to proceed from the archive alone
```

```
what encryption at rest guarantees
  the data is unreadable without the key : exactly
  the data is unreadable to whoever holds it : not
    addressed; that depends on where the key is, and a
    full-host snapshot is a question about scope rather
    than about cryptography
```

```
encryption separates the data from the key; a backup that
restores unattended has un-separated them, and the property
that proves it is the one the drill is designed to show
```

All 90 archives are encrypted with a modern authenticated cipher, keys in a managed service, none in the repository, and 4 drills a year pass with 0 manual steps. Each archive is a full host snapshot, so each contains the key material that decrypts it - 90 copies across the retained set and 270 offsite - and the unattended restore is the demonstration.

Verify it yourself:

```bash
pnpm eml run examples/the-backup-was-encrypted-and-the-key-was-in-the-backup/the_backup_was_encrypted_and_the_key_was_in_the_backup.eml
```
