# Contact book

`contact_book.eml` is a small class-based `ContactBook` — add a contact,
look one up, remove one — backed by a `self.contacts` dict mapping name to
phone number.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dict literal + subscript get/set through a `self`
attribute, a parallel `self.names` list grown via
`existing + [item] => existing` (the same dict-plus-key-list idiom as
library-catalog/inventory-tracker), and `try`/`except KeyError` in
`lookup` for a contact name that was never added. `remove_contact` needed
to genuinely drop a key rather than just flip a boolean flag (so a
post-removal `lookup` correctly falls into the `except KeyError` branch
instead of finding a stale entry) — since the interpreter models no
`del`/`.pop()`, it rebuilds `self.contacts` from scratch: a list
comprehension filters the removed name out of `self.names`, then a `for`
loop copies every surviving name's value across into a fresh dict, which
replaces `self.contacts` wholesale.

Verify it yourself:

```bash
pnpm eml transpile examples/contact-book/contact_book.eml   # -> Python
pnpm eml run examples/contact-book/contact_book.eml         # -> lookups + a real removal
pnpm eml trace examples/contact-book/contact_book.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/contact-book/contact_book.eml   # -> OK (fixpoint)
```
