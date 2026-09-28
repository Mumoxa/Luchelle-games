import { useCallback, useEffect, useRef, useState } from "react";
import { SceneBg } from "./components/SceneBg";
import { StartScreen } from "./components/StartScreen";
import { Hud } from "./components/Hud";
import { GameOverScreen, LevelBanner, PauseOverlay } from "./components/Overlays";
import { ClockPuzzle, ChoicePuzzle, PopPuzzle, ShapePuzzle } from "./components/PuzzlesTap";
import { MazePuzzle, SudokuPuzzle } from "./components/PuzzlesGrid";
import { FxLayer, fx } from "./game/fx";
import { sfx } from "./game/audio";
import { makePuzzle, SUBJECT_COLORS, type Mode, type Puzzle } from "./game/content";
import { loadScores, saveScore } from "./game/scores";

type Screen = "start" | "play" | "over";
type Status = "run" | "paused" | "levelup";

export default function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [status, setStatus] = useState<Status>("run");
  const [mode, setMode] = useState<Mode>("grade3");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [solved, setSolved] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [pkey, setPkey] = useState(0);
  const [banner, setBanner] = useState<number | null>(null);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [wrongNote, setWrongNote] = useState<string | null>(null);
  const [scores, setScores] = useState(loadScores);
  const [rank, setRank] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<((e: KeyboardEvent) => boolean) | null>(null);
  const timers = useRef<number[]>([]);
  const doneRef = useRef(false);

  const scoreRef = useRef(0); scoreRef.current = score;
  const livesRef = useRef(0); livesRef.current = lives;
  const comboRef = useRef(0); comboRef.current = combo;
  const bestComboRef = useRef(0); bestComboRef.current = bestCombo;
  const solvedRef = useRef(0); solvedRef.current = solved;
  const levelRef = useRef(1); levelRef.current = level;
  const modeRef = useRef(mode); modeRef.current = mode;
  const screenRef = useRef(screen); screenRef.current = screen;
  const statusRef = useRef(status); statusRef.current = status;

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  }, []);

  const registerKey = useCallback((fn: ((e: KeyboardEvent) => boolean) | null) => {
    keyRef.current = fn;
  }, []);

  const startRun = useCallback((m: Mode) => {
    clearTimers();
    sfx.ensure();
    sfx.click();
    doneRef.current = false;
    setMode(m);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLevel(1);
    setSolved(0);
    const ml = m === "kiddo" ? 4 : 3;
    setMaxLives(ml);
    setLives(ml);
    setBanner(null);
    setFlash(null);
    setWrongNote(null);
    setRank(null);
    setStatus("run");
    setScreen("play");
    setPuzzle(makePuzzle(m, 0, undefined, true));
    setPkey((k) => k + 1);
  }, [clearTimers]);

  const nextPuzzle = useCallback(() => {
    doneRef.current = false;
    setFlash(null);
    setWrongNote(null);
    setPuzzle((prev) => makePuzzle(modeRef.current, Math.min(levelRef.current - 1, 3), prev?.type));
    setPkey((k) => k + 1);
  }, []);

  const skipPuzzle = useCallback(() => {
    if (screenRef.current !== "play" || statusRef.current !== "run") return;
    clearTimers();
    doneRef.current = true;
    setCombo(0);
    setFlash(null);
    setWrongNote(null);
    sfx.click();
    setPuzzle((prev) => makePuzzle(modeRef.current, Math.min(levelRef.current - 1, 3), prev?.type));
    setPkey((k) => k + 1);
    window.setTimeout(() => { doneRef.current = false; }, 80);
  }, [clearTimers]);

  const succeed = useCallback((el?: HTMLElement, bonus = 0) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const nc = comboRef.current + 1;
    const ns = solvedRef.current + 1;
    const leveled = ns % 5 === 0;
    const nl = levelRef.current + (leveled ? 1 : 0);
    setCombo(nc);
    setBestCombo((b) => Math.max(b, nc));
    setSolved(ns);
    if (leveled) setLevel(nl);
    const pts = 10 + Math.min(nc - 1, 4) * 5 + bonus + (leveled ? 50 : 0);
    setScore((s) => s + pts);
    setFlash("ok");
    if (nc % 3 === 0) sfx.bigCorrect(); else sfx.correct();
    const target = el ?? cardRef.current ?? undefined;
    fx.burstAt(target, { count: 22, power: 1.15 });
    fx.textAt(target, `+${pts}`, "#fff7e2", 30);
    later(() => setFlash(null), 480);
    if (leveled) {
      later(() => { setBanner(nl); sfx.levelup(); fx.confetti(); fx.shake(5); }, 520);
      later(() => { setBanner(null); nextPuzzle(); }, 2000);
    } else later(nextPuzzle, 700);
  }, [later, nextPuzzle]);

  const fail = useCallback((_el?: HTMLElement, note?: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setCombo(0);
    setFlash("bad");
    setWrongNote(note ?? null);
    sfx.wrong();
    fx.shake(11);
    const nl = livesRef.current - 1;
    setLives(nl);
    if (nl <= 0) {
      later(() => {
        const entry = { score: scoreRef.current, mode: modeRef.current, solved: solvedRef.current, bestCombo: bestComboRef.current, date: Date.now() };
        const res = saveScore(entry);
        setScores(res.scores);
        setRank(res.rank);
        setFlash(null);
        setWrongNote(null);
        setScreen("over");
        sfx.gameover();
      }, 950);
    } else later(nextPuzzle, 1300);
  }, [later, nextPuzzle]);

  const togglePause = useCallback(() => {
    if (screenRef.current !== "play") return;
    if (statusRef.current === "run") { sfx.click(); setStatus("paused"); }
    else if (statusRef.current === "paused") { sfx.click(); setStatus("run"); }
  }, []);

  const toggleMute = useCallback(() => {
    sfx.muted = !sfx.muted;
    setMuted(sfx.muted);
    if (!sfx.muted) { sfx.ensure(); sfx.click(); }
  }, []);

  const goHome = useCallback(() => {
    clearTimers();
    doneRef.current = true;
    sfx.click();
    setStatus("run");
    setScreen("start");
    setBanner(null);
  }, [clearTimers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === " " || k.startsWith("Arrow")) e.preventDefault();
      if (screenRef.current === "start") { if (k === "Enter") startRun(modeRef.current); return; }
      if (screenRef.current === "over") { if (k === "r" || k === "R" || k === "Enter" || k === " ") startRun(modeRef.current); return; }
      if (k === "p" || k === "P" || k === "Escape") { if (!e.repeat) togglePause(); return; }
      if (k === "m" || k === "M") { if (!e.repeat) toggleMute(); return; }
      if (statusRef.current !== "run") return;
      keyRef.current?.(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startRun, togglePause, toggleMute]);

  useEffect(() => {
    const unlock = () => sfx.ensure();
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const subjectColor = puzzle ? (SUBJECT_COLORS[puzzle.subject] ?? "#ff8a2a") : "#ff8a2a";

  return (
    <div className="fixed inset-0 overflow-hidden font-body text-ink">
      <div id="shake-root" className="absolute inset-0">
        <SceneBg />
        {screen === "start" && <StartScreen scores={scores} lastMode={mode} onStart={startRun} muted={muted} onToggleMute={toggleMute} />}
        {screen === "play" && puzzle && (
          <div className="relative z-10 flex h-full flex-col items-center gap-2 px-3 md:gap-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <Hud score={score} level={level} lives={lives} maxLives={maxLives} combo={combo} muted={muted} onPause={togglePause} onMute={toggleMute} />
            <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-y-auto">
              <div ref={cardRef} key={pkey} className={`card anim-pop-in relative w-full max-w-[540px] px-3 py-3 sm:px-4 md:px-6 md:py-5 ${flash === "ok" ? "anim-card-good" : ""} ${flash === "bad" ? "anim-card-bad" : ""}`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 rounded-full border-2 border-ink px-2.5 py-1 font-display text-xs font-bold text-white md:px-3 md:text-sm" style={{ background: subjectColor }}>{puzzle.subject}</span>
                  <span className="min-w-0 flex-1 text-right font-display text-[11px] font-semibold text-ink/45 sm:text-xs md:text-sm">Puzzle {solved + 1}</span>
                  <button
                    type="button"
                    onPointerDown={(e) => { e.stopPropagation(); skipPuzzle(); }}
                    className="btn btn-cream h-10 shrink-0 px-3 text-xs sm:h-11 sm:text-sm"
                    aria-label="Skip this puzzle"
                    title="Skip this puzzle"
                  >
                    Skip ›
                  </button>
                </div>
                {puzzle.type === "pop" && <PopPuzzle p={puzzle} onSucceed={succeed} onFail={fail} registerKey={registerKey} />}
                {puzzle.type === "choice" && <ChoicePuzzle p={puzzle} onSucceed={succeed} onFail={fail} registerKey={registerKey} />}
                {puzzle.type === "shape" && <ShapePuzzle p={puzzle} onSucceed={succeed} onFail={fail} registerKey={registerKey} />}
                {puzzle.type === "clock" && <ClockPuzzle p={puzzle} onSucceed={succeed} onFail={fail} registerKey={registerKey} />}
                {puzzle.type === "maze" && <MazePuzzle p={puzzle} onSucceed={succeed} onFail={fail} registerKey={registerKey} />}
                {puzzle.type === "sudoku" && <SudokuPuzzle p={puzzle} onSucceed={succeed} onFail={fail} registerKey={registerKey} />}
                {wrongNote && <div className="anim-pop-in mt-3 rounded-2xl border-[3px] border-ink bg-coral px-4 py-2 text-center font-display text-base font-semibold text-white md:text-lg">{wrongNote}</div>}
              </div>
            </div>
            <p className="hidden text-xs font-bold text-ink/70 md:block">1–3 answer • Arrows / WASD move • P pause • M mute</p>
            <p className="text-[11px] font-bold text-ink/60 md:hidden">Tap to play • Swipe in mazes • Skip if stuck</p>
          </div>
        )}
        {screen === "play" && status === "paused" && <PauseOverlay onResume={togglePause} onRestart={() => startRun(mode)} onHome={goHome} muted={muted} onMute={toggleMute} />}
        {banner !== null && <LevelBanner level={banner} />}
        {screen === "over" && <GameOverScreen score={score} solved={solved} bestCombo={bestCombo} level={level} rank={rank} mode={mode} scores={scores} onRestart={() => startRun(mode)} onHome={goHome} />}
      </div>
      <FxLayer />
    </div>
  );
}
