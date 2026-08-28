# The setting was global and the need was per request

`the_setting_was_global_and_the_need_was_per_request.eml` - A formatting library reads its decimal separator from a process-wide setting. Requests arrive from locales that use different ones. How many requests are formatting against someone else's setting is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: A process-wide setting is the library's design and it is a reasonable one for the world the library was written in. It was written for a desktop application: one process, one user, one locale, set once at startup and never touched again. In that world a global is simpler than threading a locale through every call, and simpler is better.

The service adapts it correctly: set the separator from the request's locale, format, then restore it. Read as a sequence of three steps for one request, that is exactly right, and it is what a careful engineer writes.

The process runs 32 requests at once. "Set, use, restore" is a sequence in one request's story and an interleaving in the process's. The setting has one value for all 32 threads, and the last writer decides it for everyone.

```
requests per second   : 900
mean latency          : 40 ms
worker threads        : 32
requests from a non-default locale : 18 percent
```

```
  requests in flight at any instant : 36
  of those, wanting a different separator : 6
  separators the process can hold at once : 1
```

```
  so at any instant 6 requests are formatting against a separator
  that was set for a different request
```

```
one request's view
  1. set separator to this request's locale
  2. format
  3. restore the previous value
  correct, and it restores rather than leaking - which is the careful part
```

```
the process's view, two requests overlapping
  A sets separator to comma
  B sets separator to period
  A formats, and reads period
  A restores what it saw before it wrote, which is not what it wrote
  B formats, and reads whatever A restored
  neither request did anything wrong and both got the wrong answer
```

```
what restore does under concurrency
  single thread : puts back the process default, correctly
  two threads   : puts back whatever the other thread had set
  so a wrong value can outlive both requests that produced it
  and the next request inherits it without any locale of its own
```

```
  requests per day                    : 77760000
  from a non-default locale           : 13996800
  requests whose formatting is decided by another request's setting :
  all of them that overlap one, which at 36 in flight is effectively
  every request in the system
```

```
the test suite
  threads in the test harness : 1
  requests in flight          : 1
  interleavings possible      : 0
  tests covering the locale logic : 41, all passing
  and none of them can fail, because the defect needs two requests
```

```
  threads in production : 32
  requests in flight    : 36
```

```
control - is the per-request code correct
  sets the right value for its locale : yes
  formats after setting               : yes
  restores afterwards                 : yes, which most such code omits
  defects visible in one request      : 0
  it is more careful than average, and the care is what propagates the
  wrong value in step 3
```

```
null control - the same code in a single-request process
  requests in flight       : 1
  requests reading another's setting : 0
  same library, same global, same three steps
  the setting is per-process and the process serves one request, so
  per-process and per-request are the same scope
```

```
a setting's scope, against the scope of the thing that needs it
  per-process setting, per-process need   fine
  per-process setting, per-request need   wrong for every concurrent request
  and the wrongness is invisible at a concurrency of one
  which is the concurrency of every test
```

```
save-set-restore does not create a critical section
it creates a race with a longer window and a value that survives it
```

A process-wide separator is right for the desktop application this library was written for, and set-use-restore is the careful way to adapt it - most such code forgets the restore. The process serves 36 requests at once against one separator, 6 of them wanting a different one at any instant, and the restore in step 3 puts back a value that belonged to whichever request happened to be running. All 41 locale tests pass at a concurrency of one.

Verify it yourself:

```bash
pnpm eml run examples/the-setting-was-global-and-the-need-was-per-request/the_setting_was_global_and_the_need_was_per_request.eml
```
