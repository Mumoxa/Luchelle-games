import { useEffect } from "react";
import { fx } from "../game/fx";
import { sfx } from "../game/audio";
import type { Mode } from "../game/content";
import type { ScoreEntry } from "../game/scores";
import { ScoreBoard } from "./StartScreen";
import { useCountUp } from "./Hud";
import { HomeIcon, PlayIcon, RestartIcon, SpeakerIcon } from "./icons";

export function LevelBanner({ level }: { level: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div className="anim-bounce-big text-center">
        <div className="font-display text-6xl font-bold md:text-7xl" style={{ color: "#ffc93c", WebkitTextStroke: "3px #47281a", textShadow: "0 6px 0 rgba(71,40,26,0.4)" }}>
          LEVEL {level}
        </div>
        <div className="mt-1 font-display text-2xl font-semibold text-cream" style={{ textShadow: "0 3px 0 rgba(71,40,26,0.4)" }}>
          +50 bonus!
        </div>
      </div>
    </div>
  );
}

export function PauseOverlay({
  onResume, onRestart, onHome, muted, onMute,
}: {
  onResume: () => void; onRestart: () => void; onHome: () => void; muted: boolean; onMute: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/60 px-4" style={{ backdropFilter: "blur(3px)" }}>
      <div className="card anim-pop-in w-full max-w-xs px-5 py-6 text-center">
        <h2 className="font-display text-4xl font-bold">Paused</h2>
        <p className="mb-4 mt-1 text-sm font-bold text-ink/60">The savanna waits for you.</p>
        <div className="flex flex-col gap-2.5">
          <button onPointerDown={onResume} className="btn btn-sun py-3 text-xl"><PlayIcon /> Resume</button>
          <button onPointerDown={onRestart} className="btn btn-cream py-3 text-lg"><RestartIcon /> Restart</button>
          <div className="flex gap-2.5">
            <button onPointerDown={onHome} className="btn btn-cream flex-1 py-3 text-base"><HomeIcon /> Home</button>
            <button onPointerDown={onMute} className="btn btn-teal flex-1 py-3 text-base"><SpeakerIcon muted={muted} /> {muted ? "Sound Off" : "Sound On"}</button>
          </div>
        </div>
        <p className="mt-3 text-xs font-bold text-ink/50">P or Esc to resume</p>
      </div>
    </div>
  );
}

export function GameOverScreen({
  score, solved, bestCombo, level, rank, mode, scores, onRestart, onHome,
}: {
  score: number; solved: number; bestCombo: number; level: number; rank: number | null;
  mode: Mode; scores: ScoreEntry[]; onRestart: () => void; onHome: () => void;
}) {
  const disp = useCountUp(score);

  useEffect(() => {
    if (rank !== null && rank <= 5) {
      const t = window.setTimeout(() => { fx.confetti(); sfx.win(); }, 550);
      return () => clearTimeout(t);
    }
  }, [rank]);

  return (
    <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-4 py-6">
      <div className="card anim-pop-in w-full max-w-md px-5 py-5 text-center">
        <div className="anim-bob text-5xl" aria-hidden>🦁</div>
        <h2 className="mt-1 font-display text-4xl font-bold">Safari&apos;s Over!</h2>
        {rank !== null && rank <= 5 ? (
          <div className="anim-bounce-big mx-auto mt-2 inline-block rounded-full border-[3px] border-ink bg-sun px-4 py-1 font-display text-sm font-bold" style={{ animationDelay: "0.25s" }}>
            {rank === 1 ? "NEW SAFARI RECORD!" : `TOP ${rank} ON THE RECORDS!`}
          </div>
        ) : (
          <p className="mt-2 text-sm font-bold text-ink/60">So close to the records — go again!</p>
        )}

        <div className="mx-auto mt-3 w-fit rounded-2xl border-[3px] border-ink bg-cream2 px-8 py-2">
          <div className="font-display text-xs font-semibold tracking-widest text-ink/60">FINAL SCORE</div>
          <div className="font-display text-6xl font-bold leading-none">{disp}</div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-cream2 px-2 py-1.5">
            <div className="font-display text-2xl font-bold">{solved}</div>
            <div className="text-[10px] font-black tracking-wide text-ink/50">PUZZLES</div>
          </div>
          <div className="rounded-xl bg-cream2 px-2 py-1.5">
            <div className="font-display text-2xl font-bold">×{bestCombo}</div>
            <div className="text-[10px] font-black tracking-wide text-ink/50">BEST STREAK</div>
          </div>
          <div className="rounded-xl bg-cream2 px-2 py-1.5">
            <div className="font-display text-2xl font-bold">{level}</div>
            <div className="text-[10px] font-black tracking-wide text-ink/50">LEVEL</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Safari Records</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${mode === "kiddo" ? "bg-teal" : "bg-mango"}`}>
              {mode === "kiddo" ? "LITTLE" : "GRADE 3"}
            </span>
          </div>
          <ScoreBoard scores={scores} />
        </div>

        <div className="mt-4 flex gap-2.5">
          <button onPointerDown={onRestart} className="btn btn-sun flex-[1.6] py-3.5 text-xl"><RestartIcon /> Play Again</button>
          <button onPointerDown={onHome} className="btn btn-cream flex-1 py-3.5 text-lg"><HomeIcon /> Home</button>
        </div>
        <p className="mt-2 text-xs font-bold text-ink/50">Press R, Space or Enter to play again</p>
      </div>
    </div>
  );
}
