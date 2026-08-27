# The bug was fixed in the library and the vendored copy stayed

`the_bug_was_fixed_in_the_library_and_the_vendored_copy_stayed.eml` - An advisory is published, the library ships a fix, and the dependency scanner reports every service patched. How many are running the fixed code is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The scanner is a good scanner and reading the manifest is the right thing for it to do. A manifest is the declared truth, it is what the build resolves, it is machine-readable, and checking it costs nothing and runs on every push. There is no cheaper or more reliable way to answer "which version does this service depend on", and that question is answered exactly right, every time.

Six services vendored the library eighteen months ago, each for a real reason: one needed a patch that upstream would not take, and the other five copied that service's layout because it was the working example. Vendoring copies the code into the repository. The manifest entry stays, because the build still needs the transitive dependencies.

So the manifest says 2.4 and the import resolves to a directory. Both facts are true, and the scanner reads the one that is not executed.

```
services declaring the library  : 34
of those, vendoring a copy      : 6
```

```
what the scanner reports
  services on the fixed version : 34
  services still vulnerable     : 0
  coverage                      : 100 percent
```

```
what is executing
  services on the fixed version : 28
  services still vulnerable     : 6
  coverage                      : 82 percent
```

```
  the scanner's false negative rate : 17 percent
  the scanner's reported error rate : 0 percent
```

```
two questions that sound like one
  which version does the manifest declare   answered, correctly, in milliseconds
  which code does the import resolve to     not asked
  the second needs the repository contents, not the manifest
  and for 28 of the 34 services the two answers are the same
```

```
  a check is trusted in proportion to how often it is right
  this one is right 82 percent of the time, which is often enough to
  be trusted and not often enough to be safe
```

```
how the vendored copies spread
  1 service needed a patch upstream would not take
  5 copied that service's layout, because it was the working example
  none of the 5 needed the patch
  the reason for vendoring stopped applying and the vendoring did not
```

```
cost of the check that would find them
  read every manifest              : 34 files, already done
  look for a directory that shadows a declared package : 34 directory listings
  services where the two disagree  : 6
  the second check is the same order of work as the first
```

```
control - is the scanner wrong about anything it claims
  manifests read              : 34
  versions reported correctly : 34
  incorrect version reports   : 0
  the scanner has never been wrong about a declared version
```

```
  its output is accurate and its heading is 'services patched'
  the heading is a claim about execution and the data is about declaration
```

```
null control - the same scanner where nothing is vendored
  services vendoring a copy : 0
  scanner reports patched   : 34
  actually patched          : 34
  false negatives           : 0
  same tool, same query, same manifest format
  the error is exactly the number of services where the proxy and the thing
  it stands for have come apart
```

```
a proxy measurement, and the two numbers it needs
  is the proxy measured correctly    yes, this is what gets tested
  does the proxy track the target    this is a separate measurement
  and it is not made by the tool that reads the proxy
  a proxy that tracked perfectly when adopted can come apart later
  through a change nobody thought of as touching it
```

Reading the manifest is the cheapest and most reliable way to answer which version a service declares, and the scanner answers it correctly for all 34 of them. 6 import a directory instead, so the answer that is correct about the manifest is wrong about the process: 28 services are running the fix, the dashboard says 34, and it has never reported a version incorrectly.

Verify it yourself:

```bash
pnpm eml run examples/the-bug-was-fixed-in-the-library-and-the-vendored-copy-stayed/the_bug_was_fixed_in_the_library_and_the_vendored_copy_stayed.eml
```
