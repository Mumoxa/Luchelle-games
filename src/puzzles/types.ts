export type Mode = 'kiddo' | 'grade3';
export type Domain = 'numbers' | 'patterns' | 'space' | 'measurement' | 'data';
export type PuzzleFamily =
  | 'count' | 'choice' | 'number-line' | 'order' | 'place-value' | 'market'
  | 'clock' | 'pattern' | 'maze' | 'sudoku' | 'fractions' | 'shapes'
  | 'grouping' | 'data' | 'word-problem';

export type SkillId =
  | 'counting' | 'number-bonds' | 'addition' | 'subtraction' | 'compare' | 'number-line'
  | 'money' | 'place-value' | 'patterns' | 'multiplication' | 'division' | 'time'
  | 'calendar' | 'shapes' | 'symmetry' | 'fractions' | 'length' | 'mass' | 'capacity'
  | 'estimation' | 'logic' | 'data' | 'word-problems';

export interface PuzzleBase {
  id: string;
  family: PuzzleFamily;
  domain: Domain;
  skill: SkillId;
  tier: number;
  title: string;
  instruction: string;
  prompt: string;
  hint: string;
}

export interface ChoicePuzzle extends PuzzleBase { family: 'choice' | 'word-problem'; options: string[]; answerIndex: number; }
export interface CountPuzzle extends PuzzleBase { family: 'count'; icon: string; distractor?: string; targetCount: number; items: { id: string; kind: 'target' | 'distractor' }[]; }
export interface NumberLinePuzzle extends PuzzleBase { family: 'number-line'; start: number; end: number; step: number; target: number; choices: number[]; }
export interface OrderPuzzle extends PuzzleBase { family: 'order'; values: number[]; direction: 'asc' | 'desc'; solution: number[]; }
export interface PlaceValuePuzzle extends PuzzleBase { family: 'place-value'; hundreds: number; tens: number; ones: number; options: number[]; answerIndex: number; }
export interface MarketPuzzle extends PuzzleBase { family: 'market'; walletCents: number; items: { name: string; icon: string; cents: number; selected?: boolean }[]; basketIndexes: number[]; ask: 'total' | 'change'; options: string[]; answerIndex: number; }
export interface ClockPuzzle extends PuzzleBase { family: 'clock'; hour: number; minute: number; options: string[]; answerIndex: number; }
export interface PatternPuzzle extends PuzzleBase { family: 'pattern'; sequence: (string | number)[]; options: (string | number)[]; answerIndex: number; }
export interface MazePuzzle extends PuzzleBase { family: 'maze'; size: number; walls: number[]; start: number; goal: number; answerTargets?: { cell: number; label: string; correct: boolean }[]; }
export interface SudokuPuzzle extends PuzzleBase { family: 'sudoku'; size: 3 | 4; symbols: string[]; cells: (number | null)[]; solution: number[]; }
export interface FractionPuzzle extends PuzzleBase { family: 'fractions'; numerator: number; denominator: number; options: string[]; answerIndex: number; }
export interface ShapePuzzle extends PuzzleBase { family: 'shapes'; items: { id: string; kind: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star'; correct: boolean }[]; }
export interface GroupingPuzzle extends PuzzleBase { family: 'grouping'; total: number; groups: number; options: number[]; answerIndex: number; }
export interface DataPuzzle extends PuzzleBase { family: 'data'; rows: { label: string; icon: string; value: number }[]; options: string[]; answerIndex: number; }

export type PuzzleModel = ChoicePuzzle | CountPuzzle | NumberLinePuzzle | OrderPuzzle | PlaceValuePuzzle | MarketPuzzle | ClockPuzzle | PatternPuzzle | MazePuzzle | SudokuPuzzle | FractionPuzzle | ShapePuzzle | GroupingPuzzle | DataPuzzle;

export interface GeneratorContext { mode: Mode; skill: SkillId; tier: number; seed: string | number; avoidFamilies: PuzzleFamily[]; recentIds?: string[]; }
export interface GenerateRequest extends GeneratorContext {}
export type PuzzleOutcomeKind = 'correct' | 'wrong' | 'skip' | 'hint';
export interface PuzzleOutcome { kind: PuzzleOutcomeKind; puzzleId: string; skill: SkillId; tier: number; firstAttempt: boolean; }
export interface PuzzleFamilyDefinition { family: PuzzleFamily; skills: SkillId[]; generate: (ctx: GeneratorContext) => PuzzleModel; }
export interface ValidationResult { ok: boolean; errors: string[]; }
