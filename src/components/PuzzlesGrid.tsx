import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "../game/audio";
import { fx } from "../game/fx";
import type { MazeP, SudokuP } from "../game/content";
import type { PuzzleProps } from "./PuzzlesTap";
import { Chevron, EraserIcon } from "./icons";

function PadBtn({ dir, onMove }: { dir: "up" | "down" | "left" | "right"; onMove: () => void }) {
  return (
    <button onPointerDown={(e) => { e.stopPropagation(); onMove(); }} className="btn btn-cream no-touch h-12 w-14" aria-label={dir}>
      <Chevron dir={dir} />
    </button>
  );
}

export function MazePuzzle({ p, onSucceed, registerKey }: PuzzleProps<MazeP>) {
  const size = p.size;
  const goal = size * size - 1;
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const posRef = useRef(pos);
  const stepsRef = useRef(0);
  const [steps, setSteps] = useState(0);
  const [bump, setBump] = useState<"" | "t" | "b" | "l" | "r">("");
  const done = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const cellCenter = (r: number, c: number) => {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: rect.left + ((c + 0.5) * rect.width) / size, y: rect.top + ((r + 0.5) * rect.height) / size };
  };

  const tryMove = useCallback((dr: number, dc: number) => {
    if (done.current) return;
    const { r, c } = posRef.current;
    const w = p.walls[r * size + c];
    const blocked = (dr === -1 && w & 1) || (dr === 1 && w & 4) || (dc === -1 && w & 8) || (dc === 1 && w & 2);
    if (blocked) {
      sfx.bump(); fx.shake(3);
      setBump(dr === -1 ? "t" : dr === 1 ? "b" : dc === -1 ? "l" : "r");
      window.setTimeout(() => setBump(""), 170);
      return;
    }
    const nr = r + dr, nc = c + dc;
    posRef.current = { r: nr, c: nc };
    setPos({ r: nr, c: nc });
    stepsRef.current += 1; setSteps(stepsRef.current); sfx.move();
    const ctr = cellCenter(nr, nc);
    fx.burst(ctr.x, ctr.y, { count: 4, colors: ["#d8c9a4", "#ffc93c"], power: 0.45 });
    if (nr * size + nc === goal) {
      done.current = true;
      window.setTimeout(() => {
        sfx.bigCorrect(); fx.confetti();
        const bonus = Math.max(0, size * size - stepsRef.current) * 2;
        onSucceed(boardRef.current ?? undefined, bonus);
      }, 380);
    }
  }, [p, size, goal, onSucceed]);

  useEffect(() => {
    registerKey((e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") { tryMove(-1, 0); return true; }
      if (k === "arrowdown" || k === "s") { tryMove(1, 0); return true; }
      if (k === "arrowleft" || k === "a") { tryMove(0, -1); return true; }
      if (k === "arrowright" || k === "d") { tryMove(0, 1); return true; }
      return false;
    });
    return () => registerKey(null);
  }, [tryMove, registerKey]);

  const bumpOff = bump === "t" ? "translateY(-7px)" : bump === "b" ? "translateY(7px)" : bump === "l" ? "translateX(-7px)" : bump === "r" ? "translateX(7px)" : "";

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-display text-xl font-semibold md:text-2xl">Lead the lion to the watermelon!</p>
      <div className="flex items-center gap-2 text-xs font-black text-ink/60 md:text-sm">
        <span className="rounded-full border-2 border-ink/15 bg-cream2 px-3 py-0.5">Steps: {steps}</span>
        <span className="hidden rounded-full border-2 border-ink/15 bg-cream2 px-3 py-0.5 sm:inline">Fewer steps = bigger bonus</span>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
        <div ref={boardRef} className="no-touch relative rounded-2xl border-4 border-ink bg-cream2" style={{ width: `min(${size === 3 ? "78vw" : "82vw"}, ${size === 3 ? 300 : size === 4 ? 330 : 368}px)`, aspectRatio: "1" }} onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }} onPointerUp={(e) => {
          const s0 = swipe.current; swipe.current = null; if (!s0) return;
          const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
          if (Math.abs(dx) > Math.abs(dy)) tryMove(0, dx > 0 ? 1 : -1); else tryMove(dy > 0 ? 1 : -1, 0);
        }}>
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)` }}>
            {p.walls.map((w, i) => {
              const isGoal = i === goal;
              return <div key={i} className="flex items-center justify-center" style={{ borderTop: w & 1 ? "5px solid #47281a" : "none", borderRight: w & 2 ? "5px solid #47281a" : "none", borderBottom: w & 4 ? "5px solid #47281a" : "none", borderLeft: w & 8 ? "5px solid #47281a" : "none", background: isGoal ? "rgba(255,201,60,0.45)" : "transparent" }}>{isGoal && <span className="anim-bob text-2xl md:text-3xl" aria-hidden>🍉</span>}</div>;
            })}
          </div>
          <div className="pointer-events-none absolute z-10 flex items-center justify-center" style={{ width: `${100 / size}%`, height: `${100 / size}%`, left: `${(pos.c * 100) / size}%`, top: `${(pos.r * 100) / size}%`, transition: "left 130ms ease-out, top 130ms ease-out" }}>
            <div style={{ transform: bumpOff, transition: "transform 120ms ease", fontSize: "clamp(26px, 9vw, 44px)" }} aria-hidden>🦁</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1"><span /><PadBtn dir="up" onMove={() => tryMove(-1, 0)} /><span /><PadBtn dir="left" onMove={() => tryMove(0, -1)} /><div className="flex items-center justify-center"><div className="h-2.5 w-2.5 rounded-full bg-ink/20" /></div><PadBtn dir="right" onMove={() => tryMove(0, 1)} /><span /><PadBtn dir="down" onMove={() => tryMove(1, 0)} /><span /></div>
      </div>
      <p className="text-xs font-bold text-ink/50">Swipe, tap the pad, or use arrow keys</p>
    </div>
  );
}

function shakeCell(el?: HTMLElement) {
  if (!el) return;
  el.classList.remove("anim-card-bad");
  void el.offsetWidth;
  el.classList.add("anim-card-bad");
}

export function SudokuPuzzle({ p, onSucceed, registerKey }: PuzzleProps<SudokuP>) {
  const [cells, setCells] = useState<(number | null)[]>(p.cells);
  const givenSet = useMemo(() => new Set(p.cells.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0)), [p]);
  const [sel, setSel] = useState<number>(() => p.cells.findIndex((v) => v === null));
  const done = useRef(false);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const place = useCallback((sym: number | null) => {
    if (done.current || sel < 0) return;
    const el = cellRefs.current[sel] ?? undefined;
    if (sym === null) {
      if (givenSet.has(sel)) { sfx.bump(); shakeCell(el); return; }
      sfx.erase();
      const next = cells.map((v, i) => (i === sel ? null : v));
      setCells(next); setSel(next.findIndex((v) => v === null)); return;
    }
    if (givenSet.has(sel)) { sfx.bump(); shakeCell(el); return; }
    const size = p.size, r = Math.floor(sel / size), c = sel % size;
    for (let k = 0; k < size; k++) {
      if (cells[r * size + k] === sym || cells[k * size + c] === sym) { sfx.bump(); fx.shake(4); shakeCell(el); return; }
    }
    sfx.place(); fx.burstAt(el, { count: 8, colors: ["#7c4dff", "#ffc93c", "#fff7e2"], power: 0.6 });
    const next = cells.map((v, i) => (i === sel ? sym : v));
    setCells(next);
    const nsel = next.findIndex((v) => v === null); setSel(nsel);
    if (nsel === -1) { done.current = true; window.setTimeout(() => { sfx.win(); fx.confetti(); onSucceed(cellRefs.current[0] ?? undefined); }, 420); }
  }, [sel, cells, givenSet, p.size, onSucceed]);

  useEffect(() => {
    registerKey((e) => {
      const k = e.key;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k)) {
        setSel((prev) => {
          if (prev < 0) return prev;
          const r = Math.floor(prev / p.size), c = prev % p.size;
          let nr = r, nc = c;
          if (k === "ArrowUp") nr = (r + p.size - 1) % p.size;
          if (k === "ArrowDown") nr = (r + 1) % p.size;
          if (k === "ArrowLeft") nc = (c + p.size - 1) % p.size;
          if (k === "ArrowRight") nc = (c + 1) % p.size;
          return nr * p.size + nc;
        });
        sfx.move(); return true;
      }
      const num = Number(k);
      if (num >= 1 && num <= p.size) { place(num - 1); return true; }
      if (k === "Backspace" || k === "Delete" || k === "0") { place(null); return true; }
      return false;
    });
    return () => registerKey(null);
  }, [place, registerKey, p.size]);

  const cellCls = p.size === 3 ? "h-[76px] w-[76px] md:h-[90px] md:w-[90px] text-4xl md:text-5xl" : "h-[60px] w-[60px] md:h-[74px] md:w-[74px] text-3xl md:text-4xl";

  return (
    <div className="flex flex-col items-center gap-2.5">
      <p className="text-center font-display text-lg font-semibold md:text-2xl">Every row &amp; column gets each fruit once!</p>
      <div className="grid gap-1.5 rounded-2xl border-4 border-ink bg-mango p-2" style={{ gridTemplateColumns: `repeat(${p.size}, minmax(0, 1fr))` }}>
        {cells.map((v, i) => <button key={i} ref={(el) => { cellRefs.current[i] = el; }} onPointerDown={() => { if (!givenSet.has(i)) { setSel(i); sfx.click(); } }} className={`no-touch flex items-center justify-center rounded-xl border-[3px] transition-transform ${cellCls} ${v === null ? "border-dashed border-ink/30 bg-cream" : "border-ink bg-cream2"} ${sel === i ? "scale-105 ring-4 ring-grape" : ""}`} aria-label={`cell ${i + 1}`}>{v !== null ? p.symbols[v] : ""}</button>)}
      </div>
      <div className="flex items-center gap-2">
        {p.symbols.map((s, i) => <button key={i} onPointerDown={() => place(i)} className="btn btn-cream no-touch h-14 w-14 text-3xl md:h-16 md:w-16" aria-label={`place ${i + 1}`}>{s}</button>)}
        <button onPointerDown={() => place(null)} className="btn btn-coral no-touch h-14 w-14 md:h-16 md:w-16" aria-label="Erase"><EraserIcon /></button>
      </div>
      <p className="hidden text-xs font-bold text-ink/40 md:block">Arrows move • 1–{p.size} place • Backspace erases</p>
    </div>
  );
}
