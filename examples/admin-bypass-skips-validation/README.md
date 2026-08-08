# Admin bypass skips validation — an early return is a jump, not a permission

`admin_bypass_skips_validation.eml` pushes the same seven-record migration
payload through two save paths under three roles, then reads the store back and
re-validates every row that is in it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: an administrator escape hatch added at the top of a save
function as an early return. Written that way it reads as a statement about
*authorisation*. What it encodes is a jump past every line between it and the
write — and validation is one of those lines.

| path | role | written | rejected | denied |
| --- | --- | --- | --- | --- |
| bypass | **admin** | **7** | **0** | 0 |
| bypass | editor | 3 | 4 | 0 |
| bypass | viewer | 0 | 0 | 7 |
| checked | admin | 3 | 4 | 0 |
| checked | editor | 3 | 4 | 0 |

Read back out of the store and re-validated, `bypass/admin` holds **7 rows, 4
of which violate validation**. Every other combination holds 0 bad rows.

The four that got in are four distinct failure kinds, not one crafted row —
`empty id`, `email is not text`, `negative amount`, `unknown currency`. Those
are the shapes a migration actually produces: a null column, a numeric value
where a string belongs, a sign flip from a refund, a currency code from an
older system.

The test that would have caught it, and the role it was written as:

```
as editor: 4 rejected, 3 written
as admin:  0 rejected, 7 written
```

Validation suites are written from the caller's seat, and the caller in a
validation test is an ordinary user — that is the role the feature exists for.
Every invalid record is refused as an editor, so the suite is green and the
assertion it makes is true. The two versions also agree exactly for the editor,
so a reviewer diffing behaviour as an ordinary user sees no change at all.

The path with no validation is the path behind migrations, support tooling and
back-office repair: the callers that write in bulk, write unusual shapes, and
are trusted because a human is supervising.

Verify it yourself:

```bash
pnpm eml run examples/admin-bypass-skips-validation/admin_bypass_skips_validation.eml
```
