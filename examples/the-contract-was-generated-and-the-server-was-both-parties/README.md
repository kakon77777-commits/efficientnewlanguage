# The contract was generated and the server was both parties

`the_contract_was_generated_and_the_server_was_both_parties.eml` - Every endpoint has a contract test, the contract is generated so it cannot drift from the code, and twenty-three client repositories test against a mock built from it. Who authored the expectations is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The setup is well engineered. The contract is not a document somebody maintains by hand, so it cannot go stale; it is regenerated from the server's handler signatures on every build, so it is always an exact description of what the server does; the mock the clients test against is built from that same artifact, so no client is testing against a fiction; and a client whose build fails on a contract change hears about it in CI rather than in production.

Both sides of the comparison are produced by one party. The contract is generated from the server, so a server change regenerates the contract, regenerates the mock, and the client's tests pass against the new one.

In two years no contract test has ever failed.

```
endpoints                       : 214
  with a contract test          : 214
client repositories             : 23
parties authoring the contract  : 1
expectations authored by a consumer : 0
```

```
contract test failures in two years : 0
server changes that broke a client  : 9
  flagged by the contract       : 0
  not flagged                   : 9
  share flagged                 : 0 per ten thousand
mean days until the client noticed : 6
```

```
the generated contract
  source : the server's handler signatures
  regenerated : on every build
  can it drift from the implementation : no, and that is
    a real property a hand-written one lacks
  endpoints covered : 214 of 214
  clients testing against a fiction : none; the mock is
    built from the same artifact
  verdict : ACCURATE
```

```
  generating it is the right answer to the problem it was
  chosen for, which was documents going stale
```

```
the contract test
  one side : the server's behaviour
  the other: the contract
  where the contract came from : the server's behaviour
  so what the test asks : whether the server agrees with
    itself
  what makes it green : regeneration, which runs first
  failures in two years : 0
```

```
  an agreement needs two parties and this one has 1
```

```
reading the zero
  failures in two years : 0
  world one : the server never made a breaking change
  world two : the test cannot represent one
  what distinguishes them : whether any breaking change
    occurred
  server changes that broke a client : 9
  therefore the world is : the second
```

```
one client build after a server change
  mock rebuilt from the new contract : yes
  client tests run against it : yes
  result : green
  what the client's own code expects : whatever it
    expected before, unchanged
  where the mismatch first appears : production,
    6 days later on average
```

```
the missing side
  expectations authored by a consumer : 0
  what such an expectation is : a claim the server did
    not write and cannot rewrite
  client repositories that could publish one : 23
  what would then be possible : a red build on the
    server, caused by a client
  what is possible now : a red build caused by nobody
```

```
null control - the consumers author their own side
  endpoints covered : 214, unchanged
  repositories publishing expectations : 23
  breakages caught before release : 9
  the contract did not become more accurate; it acquired
  a second author, which is what made it an agreement
```

```
what a generated contract guarantees
  the contract describes the server exactly : always, and
    it cannot go stale, which is more than a document
    would give
  the server has not broken its consumers : not
    addressed; that is a claim about what someone else
    depends on, and nothing here records it
```

```
a check is only as strong as the independence of its two
sides; deriving one from the other removes the maintenance
cost and the disagreement at the same time, and the
disagreement was the product
```

The contract is generated from the server's handlers on every build, so it cannot go stale, covers 214 of 214 endpoints, and gives 23 client repositories a mock that is never a fiction. Both sides of the comparison come from 1 party, with 0 expectations written by a consumer, so it has failed 0 times in two years and flagged 0 of 9 changes that broke a client - 0 per ten thousand - each found in production 6 days later.

Verify it yourself:

```bash
pnpm eml run examples/the-contract-was-generated-and-the-server-was-both-parties/the_contract_was_generated_and_the_server_was_both_parties.eml
```
