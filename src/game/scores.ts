import type { Mode } from "./content";

export interface ScoreEntry {
  score: number;
  mode: Mode;
  solved: number;
  bestCombo: number;
  date: number;
}

const KEY = "safari-math-scores-v1";

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ScoreEntry[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((s) => typeof s?.score === "number")
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export function saveScore(e: ScoreEntry): { scores: ScoreEntry[]; rank: number } {
  const all = [...loadScores(), e].sort((a, b) => b.score - a.score).slice(0, 5);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
  const idx = all.findIndex((s) => s === e);
  return { scores: all, rank: idx < 0 ? 99 : idx + 1 };
}

export function fmtDate(t: number): string {
  const d = new Date(t);
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${m[d.getMonth()]}`;
}
