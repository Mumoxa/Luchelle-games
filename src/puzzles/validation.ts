import type { MazePuzzle, PuzzleModel, SudokuPuzzle, ValidationResult } from './types.ts';

function hasBadText(value: string): boolean { return /(?:undefined|NaN)/.test(value); }

function validateMaze(p: MazePuzzle, errors: string[]) {
  const n = p.size * p.size;
  if (p.walls.length !== n) errors.push('maze wall count does not match size');
  if (p.start < 0 || p.start >= n || p.goal < 0 || p.goal >= n) errors.push('maze start/goal out of bounds');
  if (errors.length) return;
  const q = [p.start];
  const seen = new Set<number>(q);
  while (q.length) {
    const i = q.shift()!;
    if (i === p.goal) return;
    const r = Math.floor(i / p.size), c = i % p.size, w = p.walls[i] ?? 15;
    const next: [number, boolean][] = [
      [i - p.size, r > 0 && !(w & 1)], [i + 1, c < p.size - 1 && !(w & 2)],
      [i + p.size, r < p.size - 1 && !(w & 4)], [i - 1, c > 0 && !(w & 8)],
    ];
    for (const [j, open] of next) if (open && !seen.has(j)) { seen.add(j); q.push(j); }
  }
  errors.push('maze goal is unreachable');
}

function validateSudoku(p: SudokuPuzzle, errors: string[]) {
  const n = p.size * p.size;
  if (p.symbols.length !== p.size) errors.push('sudoku symbol count must match size');
  if (p.symbols.some((s) => !s || !s.trim())) errors.push('sudoku required symbol is empty');
  if (new Set(p.symbols).size !== p.symbols.length) errors.push('sudoku symbols must be unique');
  if (p.cells.length !== n || p.solution.length !== n) errors.push('sudoku board length does not match size');
  if (errors.length) return;
  const expected = new Set(Array.from({ length: p.size }, (_, i) => i));
  const validGroup = (values: number[]) => values.length === p.size && values.every((v) => expected.has(v)) && new Set(values).size === p.size;
  for (let r = 0; r < p.size; r++) if (!validGroup(p.solution.slice(r * p.size, (r + 1) * p.size))) errors.push(`sudoku solution row ${r + 1} invalid`);
  for (let c = 0; c < p.size; c++) {
    const col = Array.from({ length: p.size }, (_, r) => p.solution[r * p.size + c]!);
    if (!validGroup(col)) errors.push(`sudoku solution column ${c + 1} invalid`);
  }
  p.cells.forEach((v, i) => { if (v !== null && v !== p.solution[i]) errors.push(`sudoku given ${i} conflicts with solution`); });
}

export function validatePuzzle(p: PuzzleModel): ValidationResult {
  const errors: string[] = [];
  if (!p.id?.trim()) errors.push('puzzle id is required');
  if (!p.title?.trim()) errors.push('title is required');
  if (!p.instruction?.trim()) errors.push('instruction is required');
  if (hasBadText(p.title) || hasBadText(p.instruction) || hasBadText(p.prompt)) errors.push('text contains invalid generated value');
  if (!Number.isInteger(p.tier) || p.tier < 1 || p.tier > 6) errors.push('tier must be 1–6');

  if (p.family === 'choice' || p.family === 'word-problem' || p.family === 'clock' || p.family === 'market' || p.family === 'data') {
    if (p.options.length < 2) errors.push('answer options are missing');
    if (new Set(p.options).size !== p.options.length) errors.push('duplicate answer options');
    if (!Number.isInteger(p.answerIndex) || p.answerIndex < 0 || p.answerIndex >= p.options.length) errors.push('answer index is invalid');
  }
  if (p.family === 'place-value' || p.family === 'grouping') {
    if (p.options.length < 2) errors.push('answer options are missing');
    if (new Set(p.options).size !== p.options.length) errors.push('duplicate answer options');
    if (p.answerIndex < 0 || p.answerIndex >= p.options.length) errors.push('answer index is invalid');
  }
  if (p.family === 'pattern') {
    if (p.options.length < 2 || new Set(p.options.map(String)).size !== p.options.length) errors.push('pattern options invalid');
    if (p.answerIndex < 0 || p.answerIndex >= p.options.length) errors.push('answer index is invalid');
  }
  if (p.family === 'fractions') {
    if (p.denominator <= 0 || p.numerator < 0 || p.numerator > p.denominator) errors.push('fraction values invalid');
    if (new Set(p.options).size !== p.options.length) errors.push('duplicate answer options');
    if (p.answerIndex < 0 || p.answerIndex >= p.options.length) errors.push('answer index is invalid');
  }
  if (p.family === 'count' && (p.targetCount < 1 || p.items.filter((i) => i.kind === 'target').length < p.targetCount)) errors.push('count puzzle has too few targets');
  if (p.family === 'order' && p.values.length !== p.solution.length) errors.push('order solution length mismatch');
  if (p.family === 'number-line' && !p.choices.includes(p.target)) errors.push('number line choices omit target');
  if (p.family === 'market' && (!Number.isInteger(p.walletCents) || p.walletCents < 0 || p.items.some((i) => !Number.isInteger(i.cents) || i.cents < 0))) errors.push('money values must use non-negative integer cents');
  if (p.family === 'maze') validateMaze(p, errors);
  if (p.family === 'sudoku') validateSudoku(p, errors);
  return { ok: errors.length === 0, errors };
}
