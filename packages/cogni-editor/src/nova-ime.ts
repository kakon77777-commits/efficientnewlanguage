/**
 * Nova IME — a floating symbol palette for low-friction EML input.
 * Ctrl+Space opens it; type a keyword (sum, transpose, out…), Enter inserts the
 * symbol/snippet at the cursor. Per whitepaper §3.4.
 */

interface NovaEntry {
  /** Keywords that match this entry. */
  keys: string[];
  /** What is inserted. */
  insert: string;
  /** Human label shown in the list. */
  label: string;
  /** Caret offset within `insert` after insertion (defaults to end). */
  caret?: number;
}

const ENTRIES: NovaEntry[] = [
  { keys: ['sum', 'sigma', 'Σ'], insert: 'Σ(i^2, i in [1:N])', label: 'Σ  summation', caret: 2 },
  { keys: ['range', 'inrange', 'in', '∈'], insert: 'i in [1:N]', label: 'i in [1:N]  inclusive range' },
  { keys: ['transpose', 'T'], insert: 'm^T', label: 'm^T  transpose', caret: 1 },
  { keys: ['out', 'print', 'output'], insert: 'x^0', label: 'x^0  print', caret: 1 },
  { keys: ['init', 'assign', 'set'], insert: 'x^+0', label: 'x^+0  init / add-assign', caret: 1 },
  { keys: ['bind', 'arrow', '=>', '⇒'], insert: ' => target', label: '=> target  bind result' },
  { keys: ['cond', 'if', 'ternary', '?'], insert: 'cond ? A : B', label: 'cond ? A : B  conditional', caret: 0 },
  { keys: ['matrix', 'array', 'M'], insert: '<M>(data)', label: '<M>(data)  matrix', caret: 4 },
  { keys: ['list'], insert: 'list^+[1, 2, 3]', label: 'list^+[…]  list literal', caret: 7 },
  { keys: ['pow', 'square', '^2'], insert: '^2', label: '^2  power' },
  { keys: ['sigmachar'], insert: 'Σ', label: 'Σ' },
  { keys: ['inchar'], insert: '∈', label: '∈' },
  { keys: ['arrowchar'], insert: '⇒', label: '⇒' },
];

function insertAtCursor(ta: HTMLTextAreaElement, text: string, caretOffset?: number): void {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
  const pos = start + (caretOffset ?? text.length);
  ta.selectionStart = ta.selectionEnd = pos;
  ta.focus();
}

export function attachNovaIme(ta: HTMLTextAreaElement, onInsert: () => void): { open: () => void } {
  if (ta.dataset['novaAttached']) return { open: () => {} };
  ta.dataset['novaAttached'] = '1';
  const panel = document.createElement('div');
  panel.className = 'nova';
  panel.style.display = 'none';
  const input = document.createElement('input');
  input.className = 'nova-input';
  input.placeholder = 'symbol… (sum, transpose, out, range, matrix)';
  const list = document.createElement('div');
  list.className = 'nova-list';
  panel.append(input, list);
  document.body.append(panel);

  let filtered: NovaEntry[] = ENTRIES;
  let active = 0;

  const render = (): void => {
    list.replaceChildren();
    let activeRow: HTMLDivElement | null = null;
    filtered.forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'nova-row' + (i === active ? ' active' : '');
      row.textContent = e.label;
      row.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        choose(i);
      });
      if (i === active) activeRow = row;
      list.append(row);
    });
    (activeRow as HTMLDivElement | null)?.scrollIntoView({ block: 'nearest' });
  };

  const onDocDown = (ev: MouseEvent): void => {
    if (!panel.contains(ev.target as Node)) close();
  };
  const open = (): void => {
    input.value = '';
    filtered = ENTRIES;
    active = 0;
    render();
    panel.style.display = 'block';
    input.focus();
    document.addEventListener('mousedown', onDocDown, true);
  };
  const close = (): void => {
    panel.style.display = 'none';
    document.removeEventListener('mousedown', onDocDown, true);
    ta.focus();
  };
  const choose = (i: number): void => {
    const e = filtered[i];
    if (e) {
      insertAtCursor(ta, e.insert, e.caret);
      onInsert();
    }
    close();
  };

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    filtered = q === '' ? ENTRIES : ENTRIES.filter((e) => e.keys.some((k) => k.toLowerCase().includes(q)) || e.label.toLowerCase().includes(q));
    active = 0;
    render();
  });
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      active = Math.min(active + 1, filtered.length - 1);
      render();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      active = Math.max(active - 1, 0);
      render();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      choose(active);
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      close();
    }
  });

  ta.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey && ev.code === 'Space') {
      ev.preventDefault();
      open();
    }
  });

  return { open };
}
