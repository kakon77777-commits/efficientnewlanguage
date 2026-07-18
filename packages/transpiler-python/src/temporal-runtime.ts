/**
 * Self-contained Python runtime for `@temporal_loop` (whitepaper §8.2, MVP form).
 *
 * Injected into emitted Python only when a program uses `@temporal_loop`, so the
 * output stays a runnable standalone script (`eml run` works with no extra files).
 * It is a minimal asyncio wrapper — NOT a full state machine — that demonstrates
 * the five required properties: no busy-wait (asyncio.sleep), max_wait,
 * check_interval, timeout_action, and an EML (phosphor-jsonl-v1) trace.
 */
export const TEMPORAL_RUNTIME_PREAMBLE = `# ── EML temporal runtime (Phase 3, whitepaper §8.2) ─────────────────────────
import asyncio as _eml_asyncio, json as _eml_json, sys as _eml_sys, time as _eml_time


class TemporalTimeout(Exception):
    """A temporal_wait exceeded its loop's max_wait (timeout_action='raise')."""


class DelayedDecisionQueue:
    """Pending time-gated decisions awaiting resolution; polled, never busy-waited."""

    def __init__(self):
        self._pending = []

    def add(self, name, deadline):
        item = {"name": name, "deadline": deadline}
        self._pending.append(item)
        return item

    def remove(self, item):
        if item in self._pending:
            self._pending.remove(item)

    def pending(self):
        return list(self._pending)


_EML_DDQ = DelayedDecisionQueue()
_EML_TEMPORAL_CTX = []  # stack of active @temporal_loop contexts


def _eml_trace(event_type, **fields):
    """Emit one phosphor-jsonl-v1 line to stderr (decoupled; any monitor can read)."""
    rec = {"stream": "eml", "proto": "phosphor-jsonl-v1", "type": event_type}
    rec.update(fields)
    print(_eml_json.dumps(rec), file=_eml_sys.stderr, flush=True)


def temporal_loop(max_wait=3600, check_interval=60, timeout_action="raise"):
    def _decorate(fn):
        async def _wrapped(*args, **kwargs):
            ctx = {
                "deadline": _eml_time.monotonic() + max_wait,
                "check_interval": check_interval,
                "timeout_action": timeout_action,
                "name": getattr(fn, "__name__", "temporal"),
            }
            _EML_TEMPORAL_CTX.append(ctx)
            _eml_trace("eml:temporal:start", fn=ctx["name"], max_wait=max_wait, check_interval=check_interval)
            try:
                result = await fn(*args, **kwargs)
                _eml_trace("eml:temporal:done", fn=ctx["name"], ok=True)
                return result
            except TemporalTimeout:
                _eml_trace("eml:temporal:timeout", fn=ctx["name"], ok=False)
                if timeout_action == "return":
                    return None
                raise
            finally:
                _EML_TEMPORAL_CTX.pop()

        return _wrapped

    return _decorate


async def temporal_wait(condition, name="condition"):
    """Wait until condition is truthy, polling at check_interval (no busy wait)."""
    ctx = _EML_TEMPORAL_CTX[-1] if _EML_TEMPORAL_CTX else {
        "deadline": _eml_time.monotonic() + 3600,
        "check_interval": 60,
    }
    item = _EML_DDQ.add(name, ctx["deadline"])
    try:
        while True:
            if (condition() if callable(condition) else bool(condition)):
                _eml_trace("eml:temporal:resolved", name=name, ok=True)
                return True
            remaining = ctx["deadline"] - _eml_time.monotonic()
            if remaining <= 0:
                _eml_trace("eml:temporal:timeout", name=name, ok=False)
                raise TemporalTimeout(name)
            interval = ctx["check_interval"]
            # Floor a non-positive interval so it can never busy-spin, and never
            # sleep past the deadline so max_wait is a true upper bound.
            delay = min(interval if interval > 0 else 0.05, remaining)
            _eml_trace("eml:temporal:wait", name=name, check_interval=interval)
            await _eml_asyncio.sleep(delay)  # cooperative; not a busy loop
    finally:
        _EML_DDQ.remove(item)


def run_temporal(fn, *args, **kwargs):
    """Drive an async temporal function to completion (asyncio.run)."""
    return _eml_asyncio.run(fn(*args, **kwargs))
# ────────────────────────────────────────────────────────────────────────────`;
