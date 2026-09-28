/* CAPS-flavoured Grade 3 maths content generators — varied subjects:
   Counting, Adding, Subtracting, Times Tables, Sharing, Place Value,
   Patterns, Money (R & c), Shapes, Fractions, Time, Mazes, Logic (Sudoku). */

export type Mode = "kiddo" | "grade3";
export type PuzzleType = "pop" | "choice" | "shape" | "maze" | "sudoku" | "clock";
export type ShapeKind = "circle" | "square" | "triangle" | "rectangle" | "star";

export interface PopP {
  type: "pop"; subject: string; icon: string; distractor: string; dNoun: string;
  need: number; cells: { id: number; kind: "t" | "d" }[];
}
export interface ChoiceP {
  type: "choice"; subject: string; prompt: string; options: string[]; answer: number;
}
export interface ShapeP {
  type: "shape"; subject: string; prompt: string;
  items: { id: number; kind: ShapeKind; frac?: number }[]; answer: number;
}
export interface MazeP { type: "maze"; subject: string; size: number; walls: number[]; }
export interface SudokuP { type: "sudoku"; subject: string; size: number; symbols: string[]; cells: (number | null)[]; }
export interface ClockP {
  type: "clock"; subject: string; hour: number; minute: number;
  prompt: string; options: string[]; answer: number;
}
export type Puzzle = PopP | ChoiceP | ShapeP | MazeP | SudokuP | ClockP;

export const SUBJECT_COLORS: Record<string, string> = {
  Counting: "#ff8a2a", Adding: "#ef476f", Subtracting: "#7c4dff", "Times Tables": "#ff5e5b", Sharing: "#2e9e4f", "Place Value": "#19b6a8", Patterns: "#ef476f", Money: "#2e9e4f", Shapes: "#19b6a8", Fractions: "#7c4dff", Maze: "#2e9e4f", Logic: "#7c4dff", Time: "#2f9bd6",
};

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(arr: T[]): T => arr[ri(0, arr.length - 1)];
const chance = (p: number) => Math.random() < p;
export function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function pickOpts(ans: string, wrongs: string[], n: number): { options: string[]; answer: number } { const w = wrongs.filter((x) => x !== ans).slice(0, n); const list = shuffle([ans, ...w]); return { options: list, answer: list.indexOf(ans) }; }
const moneyStr = (cents: number) => { const whole = Math.floor(cents / 100); const c = cents % 100; return c === 0 ? `R${whole}` : `R${whole} ${c}c`; };
const timeStr = (h: number, m: number) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;

const POP_SETS = [
  { icon: "🦁", noun: "lions", d: "🪨", dNoun: "rock" }, { icon: "🦒", noun: "giraffes", d: "🌵", dNoun: "cactus" }, { icon: "🐒", noun: "monkeys", d: "🌵", dNoun: "cactus" }, { icon: "🐧", noun: "penguins", d: "🪨", dNoun: "rock" }, { icon: "🦓", noun: "zebras", d: "🌵", dNoun: "cactus" }, { icon: "🦋", noun: "butterflies", d: "🪨", dNoun: "rock" }, { icon: "🍍", noun: "pineapples", d: "🪨", dNoun: "rock" }, { icon: "🍓", noun: "strawberries", d: "🌵", dNoun: "cactus" },
];

function popPuzzle(mode: Mode, tier: number): PopP {
  const s = pick(POP_SETS); const total = mode === "kiddo" ? 6 : 9; const need = mode === "kiddo" ? ri(2, 4 + Math.min(tier, 1)) : ri(3, Math.min(8, 4 + tier * 2)); const targets = Math.min(need + (chance(0.35) ? 1 : 0), total - 1);
  const cells = shuffle([...range(targets).map((id): { id: number; kind: "t" | "d" } => ({ id, kind: "t" as const })), ...range(total - targets).map((id): { id: number; kind: "t" | "d" } => ({ id: id + 100, kind: "d" as const }))]);
  return { type: "pop", subject: "Counting", icon: s.icon, distractor: s.d, dNoun: s.dNoun, need, cells };
}

function addK(tier: number) { const a = ri(1, 4 + Math.min(tier, 2)); const b = ri(1, Math.max(2, 9 - a)); const ans = a + b; return { subject: "Adding", prompt: `${a} + ${b} = ?`, ...pickOpts(String(ans), [String(ans + 1), String(ans - 1), String(ans + 2)], 1) }; }
function subK() { const a = ri(4, 9); const b = ri(1, a - 2); const ans = a - b; return { subject: "Subtracting", prompt: `${a} − ${b} = ?`, ...pickOpts(String(ans), [String(ans + 1), String(ans - 1 < 0 ? ans + 2 : ans - 1)], 1) }; }
function patK() { const s = ri(1, 5); const st = pick([1, 2]); const ans = s + 3 * st; return { subject: "Patterns", prompt: `What comes next?\n${s}, ${s + st}, ${s + 2 * st}, ?`, ...pickOpts(String(ans), [String(ans + 1), String(ans - 1), String(ans + st)], 1) }; }
function moneyK() { const a = ri(1, 4); const b = ri(1, 4); const ans = a + b; return { subject: "Money", prompt: `R${a} + R${b} = ?`, ...pickOpts(`R${ans}`, [`R${ans + 1}`, `R${ans - 1}`, `R${ans + 2}`], 1) }; }
function addG(tier: number) { const a = ri(23, 60 + tier * 12); const b = ri(14, 40 + tier * 12); const ans = a + b; return { subject: "Adding", prompt: `${a} + ${b} = ?`, ...pickOpts(String(ans), [String(ans + 1), String(ans - 1), String(ans + 10), String(ans - 10)], 3) }; }
function subG() { const a = ri(56, 98); const b = ri(17, a - 12); const ans = a - b; return { subject: "Subtracting", prompt: `${a} − ${b} = ?`, ...pickOpts(String(ans), [String(ans + 1), String(ans - 1), String(ans + 10), String(ans - 10)], 3) }; }
function mulG() { const t = pick([2, 3, 4, 5, 6, 8, 9, 10]); const m = ri(3, 9); const ans = t * m; return { subject: "Times Tables", prompt: `${t} × ${m} = ?`, ...pickOpts(String(ans), [String(t * (m + 1)), String(t * (m - 1)), String(ans + 10), String(ans - 1)], 3) }; }
function divG() { const t = pick([2, 3, 4, 5]); const m = ri(3, 8); const n = t * m; return { subject: "Sharing", prompt: `Share ${n} mangoes between ${t} friends.\nEach friend gets…`, ...pickOpts(String(m), [String(m + 1), String(m - 1), String(m + 2), String(n - m)], 3) }; }
function placeG() { const h = ri(1, 9), t = ri(0, 9), o = ri(0, 9), ans = h * 100 + t * 10 + o; return { subject: "Place Value", prompt: `${h} hundreds, ${t} tens\nand ${o} ones = ?`, ...pickOpts(String(ans), [String(ans + 10), String(ans - 10), String(ans + 100), String(ans + 1)], 3) }; }
function patG() { if (chance(0.3)) { const s = ri(2, 12); const ans = s * 8; return { subject: "Patterns", prompt: `What comes next?\n${s}, ${s * 2}, ${s * 4}, ?`, ...pickOpts(String(ans), [String(ans - s * 2), String(ans + s * 2), String(s * 4 + s)], 3) }; } const s = ri(2, 40), st = pick([2, 3, 5, 10]), ans = s + 3 * st; return { subject: "Patterns", prompt: `What comes next?\n${s}, ${s + st}, ${s + 2 * st}, ?`, ...pickOpts(String(ans), [String(ans + 1), String(ans + st), String(ans - 1), String(ans + 2 * st)], 3) }; }
function moneyG() { const have = ri(8, 25), cost = ri(3, have - 2), cents = pick([0, 20, 30, 50, 70]), ans = (have - cost) * 100 - cents; const costStr = cents === 0 ? `R${cost}` : `R${cost} ${cents}c`; return { subject: "Money", prompt: `You have R${have}.\nA lolly costs ${costStr}.\nWhat money is left?`, ...pickOpts(moneyStr(ans), [moneyStr(ans + 100), moneyStr(Math.max(50, ans - 50)), moneyStr(ans + 50), moneyStr(ans - 100)], 3) }; }
function choicePuzzle(mode: Mode, tier: number): ChoiceP { const bank = mode === "kiddo" ? [addK, subK, patK, moneyK] : [addG, subG, mulG, divG, placeG, patG, moneyG]; const r = pick(bank)(tier); return { type: "choice", subject: r.subject, prompt: r.prompt, options: r.options, answer: r.answer }; }

const SHAPES: { kind: ShapeKind; name: string }[] = [{ kind: "circle", name: "circle" }, { kind: "square", name: "square" }, { kind: "triangle", name: "triangle" }, { kind: "rectangle", name: "rectangle" }, { kind: "star", name: "star" }];
const FRAC_NAMES: Record<string, string> = { "0.5": "half", "0.25": "quarter", "0.33": "third" };
function shapePuzzle(mode: Mode, tier: number): ShapeP {
  const base = pick(SHAPES); const others = shuffle(SHAPES.filter((s) => s.kind !== base.kind));
  if (mode === "kiddo" || chance(0.45)) { const count = mode === "kiddo" ? 3 : 4; const items = shuffle([{ id: 0, kind: base.kind }, ...others.slice(0, count - 1).map((s, i) => ({ id: i + 1, kind: s.kind }))]); return { type: "shape", subject: "Shapes", prompt: `Tap the ${base.name}!`, items, answer: items.findIndex((i) => i.kind === base.kind) }; }
  const fBase = pick(SHAPES.filter((s) => s.kind === "circle" || s.kind === "square")); const fracs = ["0.5", "0.25", "0.33"]; const targetF = pick(fracs); const rest = shuffle(fracs.filter((f) => f !== targetF)); const items = shuffle([{ id: 0, kind: fBase.kind, frac: Number(targetF) }, { id: 1, kind: fBase.kind, frac: Number(rest[0]) }, { id: 2, kind: fBase.kind, frac: Number(rest[1]) }, { id: 3, kind: others[0].kind }]); void tier; return { type: "shape", subject: "Fractions", prompt: `Tap the ${FRAC_NAMES[targetF]}-shaded ${fBase.name}`, items, answer: items.findIndex((i) => i.frac === Number(targetF)) };
}

function genMaze(size: number): number[] { const n = size * size; const walls = new Array<number>(n).fill(15); const vis = new Array<boolean>(n).fill(false); const stack = [0]; vis[0] = true; while (stack.length) { const i = stack[stack.length - 1], r = Math.floor(i / size), c = i % size; const opts: number[] = []; if (r > 0 && !vis[i - size]) opts.push(0); if (r < size - 1 && !vis[i + size]) opts.push(1); if (c > 0 && !vis[i - 1]) opts.push(2); if (c < size - 1 && !vis[i + 1]) opts.push(3); if (opts.length === 0) { stack.pop(); continue; } const d = pick(opts), nIdx = [i - size, i + size, i - 1, i + 1][d], pair = [[1, 4], [4, 1], [8, 2], [2, 8]][d]; walls[i] &= ~pair[0]; walls[nIdx] &= ~pair[1]; vis[nIdx] = true; stack.push(nIdx); } return walls; }
function mazePuzzle(mode: Mode, tier: number): MazeP { const size = mode === "kiddo" ? 3 : tier < 2 ? 4 : 5; return { type: "maze", subject: "Maze", size, walls: genMaze(size) }; }

function sudokuPuzzle(mode: Mode, tier: number): SudokuP { const size = mode === "kiddo" ? 3 : 4; const holes = size === 3 ? 5 : tier < 2 ? 8 : 9; const rows = shuffle(range(size)), cols = shuffle(range(size)), labels = shuffle(range(size)); const out: (number | null)[] = []; for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) out.push(labels[(rows[r] + cols[c]) % size]); shuffle(range(size * size)).slice(0, holes).forEach((i) => { out[i] = null; }); const symbols = size === 3 ? ["🍎", "🍌", "🍓"] : ["🍎", "🍌", "🥝", ""]; return { type: "sudoku", subject: "Logic", size, symbols, cells: out }; }

function clockPuzzle(mode: Mode): ClockP {
  if (mode === "kiddo") { const h = ri(1, 12), m = pick([0, 30]), label = m === 0 ? `${h} o'clock` : `${h}:30`, wrong = m === 0 ? `${((h + 11) % 12) + 1} o'clock` : `${h} o'clock`; return { type: "clock", subject: "Time", hour: h, minute: m, prompt: "What time is it?", ...pickOpts(label, [wrong], 1) }; }
  if (chance(0.5)) { const h = ri(1, 12), m = pick([0, 15, 30, 45]); return { type: "clock", subject: "Time", hour: h, minute: m, prompt: "What time is it?", ...pickOpts(timeStr(h, m), [timeStr(h + 1, m), timeStr(h, (m + 15) % 60), timeStr(h - 1, m)], 3) }; }
  const h = ri(1, 12), m = pick([0, 15, 30, 45]), d = pick([15, 30, 45, 60, 90]), total = h * 60 + m + d, H = Math.floor(total / 60) % 12 || 12, M = total % 60;
  return { type: "clock", subject: "Time", hour: h, minute: m, prompt: `It is ${timeStr(h, m)} now.\nWhat time is it ${d} minutes later?`, ...pickOpts(timeStr(H, M), [timeStr(H, (M + 15) % 60), timeStr(H - 1 < 1 ? 12 : H - 1, M), timeStr(H + 1, M)], 3) };
}

export function makePuzzle(mode: Mode, tier: number, avoid?: PuzzleType, first = false): Puzzle {
  if (first) return popPuzzle(mode, tier);
  const pool = (["pop", "choice", "shape", "maze", "sudoku", "clock"] as PuzzleType[]).filter((t) => t !== avoid); const t = pick(pool);
  switch (t) { case "pop": return popPuzzle(mode, tier); case "choice": return choicePuzzle(mode, tier); case "shape": return shapePuzzle(mode, tier); case "maze": return mazePuzzle(mode, tier); case "sudoku": return sudokuPuzzle(mode, tier); case "clock": return clockPuzzle(mode); }
}
