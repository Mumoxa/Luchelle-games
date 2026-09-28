/* Golden-hour South African savanna — pure CSS/SVG, zero assets. */

function Cloud({ top, dur, delay, scale = 1 }: { top: string; dur: number; delay: number; scale?: number }) {
  return (
    <div className="absolute left-0" style={{ top, animation: `cloud-drift ${dur}s linear infinite`, animationDelay: `${delay}s` }}>
      <div style={{ width: 130 * scale, height: 40 * scale, position: "relative" }}>
        <div className="absolute inset-x-0 bottom-0 h-full rounded-full bg-white/80" />
        <div className="absolute rounded-full bg-white/80" style={{ width: 52 * scale, height: 52 * scale, left: 16 * scale, top: -22 * scale }} />
        <div className="absolute rounded-full bg-white/80" style={{ width: 42 * scale, height: 42 * scale, left: 58 * scale, top: -15 * scale }} />
      </div>
    </div>
  );
}

function Acacia({ left, bottom, scale = 1 }: { left: string; bottom: string; scale?: number }) {
  return (
    <div className="absolute" style={{ left, bottom, transform: `scale(${scale})`, transformOrigin: "bottom left" }}>
      <svg width="130" height="96" viewBox="0 0 130 96" aria-hidden>
        <path d="M62 94 Q64 62 54 38 M68 94 Q66 62 76 36 M66 70 Q78 62 88 58" stroke="#3a2314" strokeWidth="7" fill="none" strokeLinecap="round" />
        <ellipse cx="66" cy="30" rx="56" ry="13" fill="#235c3b" />
        <ellipse cx="66" cy="21" rx="37" ry="9" fill="#2c6b45" />
      </svg>
    </div>
  );
}

export function SceneBg() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #ffdf8f 0%, #ffbd63 30%, #ff9752 58%, #ff7d58 76%, #f4694e 100%)" }} />
      <div className="absolute" style={{ left: "10%", top: "7%", width: "min(34vw, 170px)", aspectRatio: "1" }}>
        <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle, #fff8d2 0%, #ffe466 48%, rgba(255,228,102,0) 72%)", animation: "sun-pulse 4.5s ease-in-out infinite" }} />
      </div>
      <Cloud top="10%" dur={80} delay={-20} scale={1} />
      <Cloud top="22%" dur={110} delay={-60} scale={0.7} />
      <Cloud top="5%" dur={95} delay={-80} scale={0.55} />
      <svg className="absolute bottom-0 left-0 w-full" style={{ height: "44%" }} viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M0,17 Q14,9 30,15 Q48,21 62,12 Q80,4 100,14 L100,30 L0,30 Z" fill="#3d8f63" opacity="0.55" />
        <path d="M0,23 Q20,15 42,21 Q68,27 100,19 L100,30 L0,30 Z" fill="#2f7a52" opacity="0.85" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full" style={{ height: "24%" }} viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0,8 Q12,4 25,7 Q40,10 55,6 Q72,2 88,6 Q95,8 100,7 L100,20 L0,20 Z" fill="#256b49" />
      </svg>
      <Acacia left="4%" bottom="16%" scale={0.9} />
      <Acacia left="76%" bottom="17%" scale={1.15} />
      <div className="absolute" style={{ bottom: "5%", left: 0, animation: "walk-across 38s linear infinite", fontSize: "clamp(28px, 6vw, 56px)" }}>
        <span style={{ display: "inline-block", animation: "bob 1.6s ease-in-out infinite" }}>🦁</span>
      </div>
      <div className="absolute" style={{ bottom: "3%", left: 0, animation: "walk-across-r 52s linear infinite", animationDelay: "-14s", fontSize: "clamp(34px, 7vw, 64px)" }}>
        <span style={{ display: "inline-block", animation: "bob 1.9s ease-in-out infinite" }}>🦒</span>
      </div>
      <div className="absolute" style={{ bottom: "6.5%", left: 0, animation: "walk-across 66s linear infinite", animationDelay: "-34s", fontSize: "clamp(22px, 4.5vw, 42px)" }}>
        <span style={{ display: "inline-block", animation: "bob 1.4s ease-in-out infinite" }}>🦓</span>
      </div>
    </div>
  );
}
