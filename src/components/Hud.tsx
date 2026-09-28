import { useEffect, useRef, useState } from "react";
import { HeartIcon, PauseIcon, SpeakerIcon } from "./icons";

export function useCountUp(value: number): number {
  const [disp, setDisp] = useState(value);
  const cur = useRef(value);
  useEffect(() => {
    const from = cur.current;
    const to = value;
    if (from === to) return;
    const t0 = performance.now();
    const dur = 380;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      cur.current = v;
      setDisp(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return disp;
}

export function Hud({
  score, level, lives, maxLives, combo, muted, onPause, onMute,
}: {
  score: number; level: number; lives: number; maxLives: number; combo: number;
  muted: boolean; onPause: () => void; onMute: () => void;
}) {
  const disp = useCountUp(score);
  const prevLives = useRef(lives);
  const lostIdx = lives < prevLives.current ? lives : -1;
  useEffect(() => { prevLives.current = lives; }, [lives]);

  return (
    <div className="flex w-full max-w-[540px] items-center gap-1.5 md:gap-2">
      <button onPointerDown={onPause} className="btn btn-cream h-11 w-11 shrink-0 md:h-12 md:w-12" aria-label="Pause">
        <PauseIcon />
      </button>
      <button onPointerDown={onMute} className="btn btn-cream h-11 w-11 shrink-0 md:h-12 md:w-12" aria-label="Toggle sound">
        <SpeakerIcon muted={muted} />
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-center">
        <div className="card flex items-center gap-2 rounded-2xl px-3 py-1 md:gap-3 md:px-4">
          <span className="hidden font-display text-[10px] font-semibold tracking-widest text-ink/50 md:inline md:text-xs">SCORE</span>
          <span className="font-display text-2xl font-bold leading-none md:text-3xl">{disp}</span>
          <span className="font-display rounded-full border-2 border-ink bg-sun px-2 py-0.5 text-xs font-bold md:text-sm">LV {level}</span>
        </div>
        {combo >= 2 && (
          <div className="anim-wiggle mt-1 rounded-full border-2 border-ink bg-coral px-3 py-0.5 font-display text-xs font-bold text-white md:text-sm">
            Streak ×{combo}
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-0.5 pr-0.5">
        {Array.from({ length: maxLives }, (_, i) => (
          <HeartIcon key={i} full={i < lives} justLost={i === lostIdx} />
        ))}
      </div>
    </div>
  );
}
