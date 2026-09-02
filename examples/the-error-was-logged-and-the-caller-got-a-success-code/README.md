# The error was logged and the caller got a success code

`the_error_was_logged_and_the_caller_got_a_success_code.eml` - The enrichment failure is caught, logged with a stack trace, and does not fail the request. What the caller can tell is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The decision to swallow it is correct. Enrichment is optional: it adds a display name to a record that is complete without one, and letting a best-effort lookup fail a payment would be a much worse defect. The exception is caught narrowly, logged at error with the record identifier and a stack trace, and the logs are searchable and alerted above a rate threshold.

The response is a two hundred with the field absent. Absent is also what the response carries when the field does not apply, and the schema has no third value.

Nine downstream systems read the absence, and all nine read it the same way.

```
requests per day             : 12400000
enrichment failures          : 74000
errors logged                : 74000
responses with a success code: 12400000
```

```
downstream systems           : 9
  treating absence as not applicable : 9
  able to tell the difference        : 0
```

```
the exception handler
  scope             : the enrichment call only
  logged at         : error, with the record id and a stack
  logs searchable   : yes
  rate alert        : above 124000 a day
  the request       : completes, which is correct for an
    optional lookup
  verdict           : HANDLED
```

```
  letting this fail the request would be the worse bug and
  the narrow catch is deliberate
```

```
the two states, on the wire
  the field does not apply : absent
  we tried and it failed   : absent
  status code in both cases: success
  a third representation   : not in the schema
```

```
  the information exists, in a log, on the server, keyed
  by a record id the caller does not have
```

```
share of responses missing it after a failure : 59 per ten thousand
```

```
the rate alert
  threshold, per day : 124000
  failures, per day  : 74000
  fires              : no
  what the threshold was set from : the level at which
    someone would want to know
```

```
  headroom before it fires : 50000
  the number is below the line and the line is reasonable
```

```
null control - the response states the enrichment status
  requests failed by the handler : 0, unchanged
  systems able to tell the difference : 9
  systems unable to                   : 0
  the handler did not become stricter; the two outcomes
  stopped sharing a representation
```

```
what catching and logging guarantees
  the caller is not failed by an optional step : exactly
  the caller knows the step did not run        : not
    addressed; the log is on the server and the response
    is what the caller reads
```

```
deciding not to fail a request is a decision about the status
code; it is read as a decision about the whole response, and
the body still has to say which of two things happened
```

The handler is right to swallow it: a narrow catch around an optional lookup, logged at error with a stack and a record id, searchable, with a rate alert set at a reasonable 124000 a day and 50000 of headroom under it. 74000 responses a day - 59 per ten thousand - carry a success code and an absent field that all 9 downstream systems read as not applicable.

Verify it yourself:

```bash
pnpm eml run examples/the-error-was-logged-and-the-caller-got-a-success-code/the_error_was_logged_and_the_caller_got_a_success_code.eml
```
