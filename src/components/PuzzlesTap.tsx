import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "../game/audio";
import { fx } from "../game/fx";
import type { ChoiceP, ClockP, PopP, ShapeKind, ShapeP } from "../game/content";

export interface PuzzleProps<T> {
  p: T;
  onSucceed: (el?: HTMLElement, bonus?: number) => void;
  onFail: (el?: HTMLElement, note?: string) => void;
  registerKey: (fn: ((e: KeyboardEvent) => boolean) | null) => void;
}

export function PopPuzzle({ p, onSucceed, onFail }: PuzzleProps<PopP>) {
  const [popped, setPopped] = useState<number[]>([]);
  const done = useRef(false);
  const count = popped.length;
  const win = count >= p.need;
  const tap = (cell: { id: number; kind: "t" | "d" }, el: HTMLButtonElement) => {
    if (done.current || popped.includes(cell.id)) return;
    if (cell.kind === "d") { done.current = true; onFail(el, `Oopsy! That's a ${p.dNoun} — keep hunting for the ${p.icon}`); return; }
    sfx.pop(count);
    fx.burstAt(el, { emojis: [p.icon], count: 14, colors: ["#ffc93c", "#ff8a2a", "#fff7e2"], power: 0.9 });
    const next = [...popped, cell.id]; setPopped(next);
    if (next.length >= p.need) { done.current = true; window.setTimeout(() => onSucceed(el), 340); }
  };
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      <div className="flex items-center gap-2.5"><span className="text-4xl md:text-5xl" aria-hidden>{p.icon}</span><span className="font-display text-2xl font-semibold md:text-3xl">Pop {p.need}!</span></div>
      <div className="font-display text-5xl font-bold leading-none text-teal md:text-6xl">{Math.min(count, p.need)}<span className="text-2xl text-ink/40 md:text-3xl"> / {p.need}</span></div>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {p.cells.map((c) => {
          const isGone = popped.includes(c.id);
          return <button key={c.id} disabled={isGone} onPointerDown={(e) => tap(c, e.currentTarget)} className={`btn btn-cream no-touch flex aspect-square w-full items-center justify-center text-4xl md:text-5xl ${isGone ? "anim-fruit-pop pointer-events-none" : win && c.kind === "t" ? "anim-glow-ring" : ""}`} aria-label={c.kind === "t" ? "target" : "distractor"}>{c.kind === "t" ? p.icon : p.distractor}</button>;
        })}
      </div>
      <p className="text-xs font-bold text-ink/50">Watch out for the {p.dNoun}s!</p>
    </div>
  );
}

export function ChoicePuzzle({ p, onSucceed, onFail, registerKey }: PuzzleProps<ChoiceP>) {
  const [picked, setPicked] = useState<number | null>(null);
  const pickedRef = useRef<number | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pick = useCallback((i: number, el?: HTMLElement) => {
    if (pickedRef.current !== null) return;
    pickedRef.current = i; setPicked(i);
    if (i === p.answer) window.setTimeout(() => onSucceed(el), 320); else onFail(el, `The answer is ${p.options[p.answer]}`);
  }, [p, onSucceed, onFail]);
  useEffect(() => {
    registerKey((e) => { const n = Number(e.key); if (n >= 1 && n <= p.options.length) { pick(n - 1, btnRefs.current[n - 1] ?? undefined); return true; } return false; });
    return () => registerKey(null);
  }, [pick, registerKey, p.options.length]);
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4">
      <p className="whitespace-pre-line text-center font-display text-2xl font-semibold leading-tight md:text-4xl">{p.prompt}</p>
      <div className={`grid w-full gap-2.5 md:gap-3 ${p.options.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {p.options.map((opt, i) => { let cls = "btn btn-cream"; if (picked === i && i === p.answer) cls = "btn btn-teal anim-pop-in"; else if (picked === i) cls = "btn btn-coral"; else if (picked !== null && i === p.answer) cls = "btn btn-teal anim-wiggle"; return <button key={i} ref={(el) => { btnRefs.current[i] = el; }} onPointerDown={(e) => pick(i, e.currentTarget)} className={`${cls} no-touch py-4 text-2xl font-bold md:py-5 md:text-3xl`}>{opt}</button>; })}
      </div>
      <p className="hidden text-xs font-bold text-ink/40 md:block">Keys 1–{p.options.length} also work</p>
    </div>
  );
}

const STAR_PTS = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 42 : 18;
  const a = -Math.PI / 2 + (Math.PI / 5) * i;
  return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
}).join(" ");

function wedge(cx: number, cy: number, r: number, frac: number): string {
  const a0 = -Math.PI / 2;
  const a1 = a0 + frac * Math.PI * 2;
  const large = frac > 0.5 ? 1 : 0;
  return `M${cx},${cy} L${(cx + r * Math.cos(a0)).toFixed(2)},${(cy + r * Math.sin(a0)).toFixed(2)} A${r},${r} 0 ${large} 1 ${(cx + r * Math.cos(a1)).toFixed(2)},${(cy + r * Math.sin(a1)).toFixed(2)} Z`;
}

export function ShapeSvg({ kind, frac, size = 84 }: { kind: ShapeKind; frac?: number; size?: number }) {
  const ink = "#47281a", base = "#19b6a8", shade = "#ff8a2a";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {kind === "circle" && <><circle cx="50" cy="50" r="42" fill={base} />{frac !== undefined && <path d={wedge(50, 50, 42, frac)} fill={shade} opacity="0.9" />}<circle cx="50" cy="50" r="42" fill="none" stroke={ink} strokeWidth="4" /></>}
      {kind === "square" && <><rect x="12" y="12" width="76" height="76" fill={base} />{frac !== undefined && <rect x="12" y="12" width={(76 * frac).toFixed(1)} height="76" fill={shade} opacity="0.9" />}<rect x="12" y="12" width="76" height="76" fill="none" stroke={ink} strokeWidth="4" /></>}
      {kind === "triangle" && <polygon points="50,10 92,88 8,88" fill={base} stroke={ink} strokeWidth="4" strokeLinejoin="round" />}
      {kind === "rectangle" && <rect x="8" y="26" width="84" height="48" fill={base} stroke={ink} strokeWidth="4" />}
      {kind === "star" && <polygon points={STAR_PTS} fill={base} stroke={ink} strokeWidth="4" strokeLinejoin="round" />}
    </svg>
  );
}

export function ShapePuzzle({ p, onSucceed, onFail, registerKey }: PuzzleProps<ShapeP>) {
  const [picked, setPicked] = useState<number | null>(null); const pickedRef = useRef<number | null>(null); const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pick = useCallback((i: number, el?: HTMLElement) => { if (pickedRef.current !== null) return; pickedRef.current = i; setPicked(i); if (i === p.answer) window.setTimeout(() => onSucceed(el), 320); else onFail(el, "Not quite — look for the right shape!"); }, [p, onSucceed, onFail]);
  useEffect(() => { registerKey((e) => { const n = Number(e.key); if (n >= 1 && n <= p.items.length) { pick(n - 1, btnRefs.current[n - 1] ?? undefined); return true; } return false; }); return () => registerKey(null); }, [pick, registerKey, p.items.length]);
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4">
      <p className="text-center font-display text-2xl font-semibold md:text-4xl">{p.prompt}</p>
      <div className={`grid w-full gap-2.5 md:gap-3 ${p.items.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {p.items.map((it, i) => { let cls = "btn btn-cream"; if (picked === i && i === p.answer) cls = "btn btn-teal anim-pop-in"; else if (picked === i) cls = "btn btn-coral"; else if (picked !== null && i === p.answer) cls = "btn btn-teal anim-wiggle"; return <button key={it.id} ref={(el) => { btnRefs.current[i] = el; }} onPointerDown={(e) => pick(i, e.currentTarget)} className={`${cls} no-touch flex aspect-square items-center justify-center`}><ShapeSvg kind={it.kind} frac={it.frac} size={p.items.length === 3 ? 78 : 66} /></button>; })}
      </div>
    </div>
  );
}

function ClockSvg({ hour, minute, spin }: { hour: number; minute: number; spin: boolean }) {
  const hd = spin ? ((hour % 12) + minute / 60) * 30 : 0;
  const md = spin ? minute * 6 : 0;
  return (
    <svg width="180" height="180" viewBox="0 0 200 200" className="drop-shadow-md" aria-hidden>
      <circle cx="100" cy="100" r="92" fill="#fff7e2" stroke="#47281a" strokeWidth="7" />
      {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; const big = i % 3 === 0; const r2 = big ? 64 : 74; return <line key={i} x1={100 + Math.sin(a) * 82} y1={100 - Math.cos(a) * 82} x2={100 + Math.sin(a) * r2} y2={100 - Math.cos(a) * r2} stroke="#47281a" strokeWidth={big ? 5 : 3} strokeLinecap="round" />; })}
      <text x="100" y="48" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="20" fill="#47281a">12</text><text x="158" y="107" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="20" fill="#47281a">3</text><text x="100" y="166" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="20" fill="#47281a">6</text><text x="42" y="107" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="20" fill="#47281a">9</text>
      <g style={{ transform: `rotate(${hd}deg)`, transformOrigin: "100px 100px", transition: "transform 1s cubic-bezier(0.34,1.3,0.5,1)" }}><rect x="94.5" y="46" width="11" height="58" rx="5.5" fill="#ef476f" stroke="#47281a" strokeWidth="2.5" /></g>
      <g style={{ transform: `rotate(${md}deg)`, transformOrigin: "100px 100px", transition: "transform 1s cubic-bezier(0.34,1.3,0.5,1)" }}><rect x="96.5" y="30" width="7" height="74" rx="3.5" fill="#2f9bd6" stroke="#47281a" strokeWidth="2.5" /></g>
      <circle cx="100" cy="100" r="8" fill="#47281a" />
    </svg>
  );
}

export function ClockPuzzle({ p, onSucceed, onFail, registerKey }: PuzzleProps<ClockP>) {
  const [spin, setSpin] = useState(false); const [picked, setPicked] = useState<number | null>(null); const pickedRef = useRef<number | null>(null); const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { const t = window.setTimeout(() => setSpin(true), 90); return () => clearTimeout(t); }, []);
  const pick = useCallback((i: number, el?: HTMLElement) => { if (pickedRef.current !== null) return; pickedRef.current = i; setPicked(i); if (i === p.answer) window.setTimeout(() => onSucceed(el), 320); else onFail(el, `The clock says ${p.options[p.answer]}.`); }, [p, onSucceed, onFail]);
  useEffect(() => { registerKey((e) => { const n = Number(e.key); if (n >= 1 && n <= p.options.length) { pick(n - 1, btnRefs.current[n - 1] ?? undefined); return true; } return false; }); return () => registerKey(null); }, [pick, registerKey, p.options.length]);
  return (
    <div className="flex flex-col items-center gap-2.5 md:gap-3">
      <p className="whitespace-pre-line text-center font-display text-2xl font-semibold leading-tight md:text-4xl">{p.prompt}</p>
      <ClockSvg hour={p.hour} minute={p.minute} spin={spin} />
      <div className={`grid w-full gap-2.5 md:gap-3 ${p.options.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {p.options.map((opt, i) => { let cls = "btn btn-cream"; if (picked === i && i === p.answer) cls = "btn btn-teal anim-pop-in"; else if (picked === i) cls = "btn btn-coral"; else if (picked !== null && i === p.answer) cls = "btn btn-teal anim-wiggle"; return <button key={i} ref={(el) => { btnRefs.current[i] = el; }} onPointerDown={(e) => pick(i, e.currentTarget)} className={`${cls} no-touch py-3 text-xl font-bold md:py-4 md:text-2xl`}>{opt}</button>; })}
      </div>
    </div>
  );
}
