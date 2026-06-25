/**
 * Stable, deterministic Python formatting.
 *
 * The emitter already produces canonical output; this layer only guarantees
 * stability: trailing whitespace is stripped, runs of blank lines are
 * collapsed, and the file ends with exactly one newline. It never rewrites
 * semantics.
 */
export function formatPython(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let blankRun = 0;
  for (const raw of lines) {
    const line = raw.replace(/[ \t]+$/, '');
    if (line === '') {
      blankRun++;
      if (blankRun <= 1) out.push('');
    } else {
      blankRun = 0;
      out.push(line);
    }
  }
  // drop leading/trailing blank lines
  while (out.length > 0 && out[0] === '') out.shift();
  while (out.length > 0 && out[out.length - 1] === '') out.pop();
  return out.join('\n') + '\n';
}
