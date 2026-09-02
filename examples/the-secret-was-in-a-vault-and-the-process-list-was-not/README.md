# The secret was in a vault and the process list was not

`the_secret_was_in_a_vault_and_the_process_list_was_not.eml` - No secret is in the source, the scanner proves it over forty-one thousand commits, and every one is fetched from a vault at boot. How many copies exist is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The vault is used properly. Nothing is committed, nothing is baked into an image, access is per-service and audited, rotation is automated and has been exercised, and a secret scanner runs on every push and over the whole history. Zero findings is a real zero and it took a migration to get there.

A vault controls where a secret is STORED and who may fetch it. After the fetch it is a string in a process, and what that process does with it is not something the vault can see.

The service starts its worker as a child process and passes twelve of them as command-line arguments. Argv is world-readable on this platform.

```
secrets in the vault         : 47
found in the repository      : 0
commits scanned              : 41000
```

```
passed as command arguments  : 12
hosts                        : 240
copies visible in process lists : 2880
```

```
the controls that exist
  committed to the repository : 0
  baked into an image         : none
  access                      : per service, audited
  rotation                    : automated, exercised
  scanner over full history   : 41000 commits, clean
  verdict                     : NOT IN THE SOURCE
```

```
  this is a real posture and reaching it took a migration;
  none of it is decorative
```

```
the life of one secret
  fetched from the vault : in memory, correctly
  passed to a child      : as argv
  readable by            : any local user, via the process
    list
  captured by            : the monitoring agent, which
    ships argv with every process sample
  retained for, days     : 400
```

```
  the vault's audit log records one fetch; the aggregator
  records the value
```

```
share of the vault's contents in a process list : 2553 per ten thousand
```

```
rotation against retention
  rotation period, days   : 30
  log retention, days     : 400
  rotations inside the window : 13
  values a reader of the logs can see : all of them
```

```
  rotating faster increases the number of distinct values
  in the aggregator and shortens the life of each; it does
  not remove the channel
```

```
null control - handed over a pipe instead of on argv
  committed to the repository : 0, unchanged
  copies in process lists     : 0
  secrets living only in memory : 47
  the vault did not become stronger; the value stopped
  being written where the operating system publishes it
```

```
what a vault guarantees
  the secret is not at rest anywhere you did not put it : exactly
  the secret is not readable                            : not
    addressed; the vault's boundary ends at the fetch, and
    every copy after that is the application's decision
```

```
secret management is about custody and the leak is about
handling; a scanner that searches the places you control
cannot search the places the operating system creates
```

No secret is in the source and the scanner's zero is real: 41000 commits clean, nothing in an image, per-service audited access, automated rotation. 12 of the 47 - 2553 per ten thousand - are passed to a child on the command line, so 2880 copies sit in process lists across 240 hosts and every rotation since adds another to 400 days of monitoring data.

Verify it yourself:

```bash
pnpm eml run examples/the-secret-was-in-a-vault-and-the-process-list-was-not/the_secret_was_in_a_vault_and_the_process_list_was_not.eml
```
