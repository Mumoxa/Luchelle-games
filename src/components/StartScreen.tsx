import type { Mode } from "../game/content";
import { fmtDate, type ScoreEntry } from "../game/scores";
import { SpeakerIcon } from "./icons";

const MEDALS = ["🥇", "🥈", "🥉", "4.", "5."];

export function ScoreBoard({ scores }: { scores: ScoreEntry[] }) {
  if (!scores.length) {
    return <p className="py-2 text-center font-bold text-ink/50">No adventures yet — be the first explorer!</p>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {scores.map((s, i) => (
        <div key={`${s.date}-${i}`} className="flex items-center gap-2 rounded-xl border-2 border-ink/15 bg-cream2 px-3 py-1.5">
          <span className="w-7 text-center font-display text-lg font-bold">{MEDALS[i]}</span>
          <span className="flex-1 font-display text-xl font-bold">{s.score}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${s.mode === "kiddo" ? "bg-teal" : "bg-mango"}`}>
            {s.mode === "kiddo" ? "LITTLE" : "GRADE 3"}
          </span>
          <span className="text-xs font-bold text-ink/50">{fmtDate(s.date)}</span>
        </div>
      ))}
    </div>
  );
}

export function StartScreen({
  scores, lastMode, onStart, muted, onToggleMute,
}: {
  scores: ScoreEntry[]; lastMode: Mode; onStart: (m: Mode) => void; muted: boolean; onToggleMute: () => void;
}) {
  return (
    <div className="relative z-10 h-full overflow-y-auto">
      <button onPointerDown={onToggleMute} className="btn btn-cream absolute right-3 z-20 h-12 w-12" style={{ top: "max(0.75rem, env(safe-area-inset-top))" }} aria-label="Toggle sound">
        <SpeakerIcon muted={muted} />
      </button>
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-8">
        <div className="anim-slide-up text-center">
          <div className="font-display font-bold tracking-wide" style={{ fontSize: "clamp(38px, 9.5vw, 62px)", color: "#fff7e2", WebkitTextStroke: "2.5px #47281a", textShadow: "0 5px 0 rgba(71,40,26,0.35)", lineHeight: 1 }}>
            {"SAFARI".split("").map((ch, i) => (
              <span key={i} className="title-letter" style={{ animationDelay: `${i * 0.09}s` }}>{ch}</span>
            ))}
          </div>
          <div className="font-display font-bold" style={{ fontSize: "clamp(58px, 15vw, 92px)", color: "#ffc93c", WebkitTextStroke: "3px #47281a", textShadow: "0 6px 0 rgba(71,40,26,0.35)", lineHeight: 0.95 }}>MATHS</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-cream px-4 py-1.5 font-display text-sm font-semibold text-ink md:text-base"><span aria-hidden>🇿🇦</span> Grade 3 • CAPS Maths Adventure</div>
        </div>
        <div className="anim-slide-up grid w-full gap-3 sm:grid-cols-2" style={{ animationDelay: "0.1s" }}>
          <button onPointerDown={() => onStart("kiddo")} className="btn btn-teal flex-col !gap-1 px-5 py-4">
            <span className="text-4xl" aria-hidden>🧒</span><span className="font-display text-2xl leading-none">Little Explorer</span><span className="font-body text-xs font-bold opacity-90">Ages 3–5 • easy counts, shapes &amp; mazes</span>
          </button>
          <button onPointerDown={() => onStart("grade3")} className="btn btn-sun flex-col !gap-1 px-5 py-4">
            <span className="text-4xl" aria-hidden>🎒</span><span className="font-display text-2xl leading-none">Grade 3 Safari</span><span className="font-body text-xs font-bold opacity-90">CAPS • tables, money, fractions &amp; logic</span>
          </button>
        </div>
        <div className="card anim-slide-up w-full px-4 py-3" style={{ animationDelay: "0.18s" }}>
          <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Safari Records</h2><span className="text-xs font-black tracking-wide text-ink/50">TOP 5</span></div>
          <ScoreBoard scores={scores} />
        </div>
        <p className="text-center text-xs font-bold text-ink/70">Tap a mode to start! • Keys 1–3 answer • Arrows &amp; swipes for mazes • P pauses</p>
        <span className="sr-only">{lastMode}</span>
      </div>
    </div>
  );
}
