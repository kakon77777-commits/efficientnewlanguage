# The permission was inherited and the link bypassed the parent

`the_permission_was_inherited_and_the_link_bypassed_the_parent.eml` - Access is decided server-side by walking to the parent folder, with no client-side hiding, and a red team found no way past it. What that walk decides is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The authorisation is built correctly. There is one service that answers every access question, so there is no second implementation to drift; the decision is made on the server and the client is never trusted to hide anything; the folder is walked on every request rather than cached into a token; and a red-team engagement spent two weeks on it and found zero ways past the folder check.

The walk answers "may this principal reach this object THROUGH this folder". A share link names the object directly, so the link is not a request the walk is asked about; the link is itself the grant.

Thirty-one thousand objects were moved into a restricted folder this year.

```
objects                         : 2400000
authorisation services          : 1
client-side hiding              : 0
red team days                   : 14
  bypasses of the folder check  : 0
```

```
objects moved into a restricted folder : 31000
  with no pre-existing link     : 26900
  that already had a direct link: 4100
  share                         : 1322 per ten thousand
links revoked by the move       : 0
reconciliations between the two : 0
```

```
the authorisation
  implementations : 1, so there is nothing to drift
  decided where   : the server
  client-side hiding relied on : 0
  folder walked per request or cached into a token :
    walked, every time
  red team : 14 days, 0 bypasses
  verdict : ENFORCED
```

```
  one implementation walked fresh on every request is the
  design that makes a red-team zero mean something
```

```
the question the walk answers
  form : may this principal reach this object through
    this folder
  what it consults : the chain of parents
  what a share link is : a row naming the object
  does the link resolution walk the parents : no; there is
    nothing to walk, the grant names the object
  is that a bypass of the check : no; it is a different
    question, answered correctly by a different table
```

```
  the folder is the thing everybody reasons about and the
  object has grants of its own that nothing compares to it
```

```
the move
  what the person intends : this is now restricted
  what changes            : the parent, and therefore
    every answer the walk gives
  who loses access        : everyone reaching it by
    browsing
  who does not            : everyone holding a link
  links revoked by the move : 0
  is the person told      : no; the move succeeded
```

```
the engagement
  scope : can the folder check be defeated
  answer: no, in 14 days
  what a valid link is : not a defeat of the check
  who holds the links : people who were given them, at a
    time when giving them was correct
  what changed since : the folder, not the link
```

```
where access lives
  the folder ACL      : consulted on every walk
  the object grants   : consulted when a link resolves
  a query joining them: 0
  which one an admin reviews : the folder, in the UI
  where the object grants appear in that UI : on the
    object, one at a time
  objects : 2400000
```

```
null control - a move re-evaluates the object's own grants
  red team bypasses : 0, unchanged
  links revoked by the move : 4100
  objects reachable by a link the parent forbids : 0
  the check did not get stricter; the action a person
  takes to restrict something started reaching the second
  way in
```

```
what an inherited permission guarantees
  nobody reaches this object through this folder without
    the right : exactly, on every request, one
    implementation, red-teamed
  nobody reaches this object            : not addressed;
    inheritance is a statement about a path, and an
    object can be named without walking one
```

```
a permission model computed by traversal is exactly as
complete as the set of ways to arrive; a direct reference
is not an attack on the traversal, it is a second door that
the traversal was never asked about
```

Access is decided by 1 server-side service that walks the parents on every request with 0 reliance on client-side hiding, and 14 red-team days found 0 bypasses. A share link names the object instead of walking to it, so of 31000 objects moved into a restricted folder this year, 4100 - 1322 per ten thousand - carried a link the move did not touch, with 0 revoked and 0 queries anywhere that compare the two tables.

Verify it yourself:

```bash
pnpm eml run examples/the-permission-was-inherited-and-the-link-bypassed-the-parent/the_permission_was_inherited_and_the_link_bypassed_the_parent.eml
```
