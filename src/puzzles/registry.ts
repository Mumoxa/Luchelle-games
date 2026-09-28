import { createRng } from './rng.ts';
import { validatePuzzle } from './validation.ts';
import type { GenerateRequest, GeneratorContext, PuzzleFamilyDefinition, PuzzleModel } from './types.ts';

const registry: PuzzleFamilyDefinition[] = [];
const testRegistry: PuzzleFamilyDefinition[] = [];

export function registerPuzzleFamily(definition: PuzzleFamilyDefinition, testOnly = false): void {
  const target = testOnly ? testRegistry : registry;
  const idx = target.findIndex((x) => x.family === definition.family && x.skills.join('|') === definition.skills.join('|'));
  if (idx >= 0) target[idx] = definition; else target.push(definition);
}

export function clearTestFamilies(): void { testRegistry.length = 0; }
export function listPuzzleFamilies(): PuzzleFamilyDefinition[] { return [...registry]; }

function safeFallback(request: GenerateRequest): PuzzleModel {
  const rng = createRng(`${request.seed}:fallback`);
  const a = rng.int(2, 9), b = rng.int(1, 9), answer = a + b;
  const raw = [answer, answer + 1, Math.max(0, answer - 1), answer + 2];
  const options = rng.shuffle([...new Set(raw)]).map(String).slice(0, 4);
  const ans = String(answer);
  if (!options.includes(ans)) options[0] = ans;
  return {
    id: `safe-add-${String(request.seed)}`,
    family: 'choice', domain: 'numbers', skill: 'addition', tier: 1,
    title: 'Quick Add', instruction: 'Tap the correct answer.', prompt: `${a} + ${b} = ?`,
    options, answerIndex: options.indexOf(ans), hint: `Start at ${a} and count on ${b}.`,
  };
}

export function generatePuzzle(request: GenerateRequest): PuzzleModel {
  const source = testRegistry.length ? testRegistry : registry;
  const matching = source.filter((d) => d.skills.includes(request.skill) && !request.avoidFamilies.includes(d.family));
  const candidates = matching.length ? matching : source.filter((d) => !request.avoidFamilies.includes(d.family));
  if (!candidates.length) return safeFallback(request);
  for (let attempt = 0; attempt < 5; attempt++) {
    const rng = createRng(`${request.seed}:${attempt}:family`);
    const def = rng.pick(candidates);
    const ctx: GeneratorContext = { ...request, seed: `${request.seed}:${attempt}` };
    try {
      const puzzle = def.generate(ctx);
      if (validatePuzzle(puzzle).ok) return puzzle;
    } catch {
      // Treat generator exceptions as invalid output and retry with a derived seed.
    }
  }
  return safeFallback(request);
}
