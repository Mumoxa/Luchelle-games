import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from './rng.ts';
import { validatePuzzle } from './validation.ts';
import { generatePuzzle, registerPuzzleFamily, clearTestFamilies } from './registry.ts';
import type { ChoicePuzzle, GeneratorContext, PuzzleModel } from './types.ts';

test('same seed produces the same deterministic sequence', () => {
  const a = createRng('luchelle');
  const b = createRng('luchelle');
  const seqA = [a.int(1, 100), a.int(1, 100), a.pick(['a','b','c']), ...a.shuffle([1,2,3,4])];
  const seqB = [b.int(1, 100), b.int(1, 100), b.pick(['a','b','c']), ...b.shuffle([1,2,3,4])];
  assert.deepEqual(seqA, seqB);
});

test('different seeds produce a different sequence', () => {
  const a = createRng('one');
  const b = createRng('two');
  assert.notDeepEqual([a.int(1, 100000), a.int(1, 100000), a.int(1, 100000)], [b.int(1, 100000), b.int(1, 100000), b.int(1, 100000)]);
});

test('validator rejects duplicate choice options and invalid answer index', () => {
  const bad: ChoicePuzzle = {
    id: 'bad-choice', family: 'choice', domain: 'numbers', skill: 'addition', tier: 1,
    title: 'Add', instruction: 'Choose the answer', prompt: '2 + 2 = ?', options: ['4','4','5'], answerIndex: 9, hint: 'Count on two.'
  };
  const result = validatePuzzle(bad);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /duplicate|answer/i);
});

test('validator rejects Sudoku with an empty required symbol', () => {
  const result = validatePuzzle({
    id: 'bad-sudoku', family: 'sudoku', domain: 'patterns', skill: 'logic', tier: 2,
    title: 'Fruit Logic', instruction: 'Each fruit once per row and column', prompt: '', size: 4,
    symbols: ['🍎','🍌','🥝',''], cells: [0,1,2,3, 1,2,3,0, 2,3,0,1, 3,0,1,null],
    solution: [0,1,2,3, 1,2,3,0, 2,3,0,1, 3,0,1,2], hint: 'Check the row.'
  } as PuzzleModel);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /symbol/i);
});

test('generator retries invalid puzzles then returns a safe fallback', () => {
  clearTestFamilies();
  let attempts = 0;
  registerPuzzleFamily({
    family: 'choice', skills: ['addition'],
    generate: (_ctx: GeneratorContext): PuzzleModel => {
      attempts += 1;
      return { id: `broken-${attempts}`, family: 'choice', domain: 'numbers', skill: 'addition', tier: 1,
        title: 'Broken', instruction: 'Choose', prompt: '1 + 1 = ?', options: ['2','2'], answerIndex: 0, hint: 'Add.' };
    }
  }, true);
  const puzzle = generatePuzzle({ mode: 'grade3', skill: 'addition', tier: 1, seed: 'fallback-test', avoidFamilies: [] });
  assert.equal(attempts, 5);
  assert.equal(validatePuzzle(puzzle).ok, true);
  assert.doesNotMatch(puzzle.id, /^broken-/);
  clearTestFamilies();
});
