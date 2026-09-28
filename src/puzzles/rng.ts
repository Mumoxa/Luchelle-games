export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  chance(probability: number): boolean;
}

function hashSeed(seed: string | number): number {
  const text = String(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(seed: string | number): Rng {
  let state = hashSeed(seed) || 0x6d2b79f5;
  const next = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, max) {
      if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) throw new Error('Invalid integer range');
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      if (!items.length) throw new Error('Cannot pick from an empty list');
      return items[Math.floor(next() * items.length)]!;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j]!, out[i]!];
      }
      return out;
    },
    chance(probability: number) {
      return next() < Math.max(0, Math.min(1, probability));
    },
  };
}
