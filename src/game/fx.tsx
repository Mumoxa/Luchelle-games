import { useEffect, useRef } from "react";

type PKind = "dot" | "star" | "confetti" | "emoji" | "text";
interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; kind: PKind; rot: number; vr: number; g: number; drag: number; text?: string; emoji?: string; }

const PALETTE = ["#ffc93c", "#ff8a2a", "#ff5e5b", "#19b6a8", "#4caf50", "#7c4dff", "#ef476f", "#fff7e2"];
const MAX_PARTS = 420;
const parts: P[] = [];
let shakeAmt = 0;
let rootEl: HTMLElement | null = null;

function push(p: P) { if (parts.length >= MAX_PARTS) parts.splice(0, parts.length - MAX_PARTS + 1); parts.push(p); }
function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const rad = i % 2 === 0 ? r : r * 0.45; const a = rot + (Math.PI / 5) * i - Math.PI / 2; const px = x + Math.cos(a) * rad; const py = y + Math.sin(a) * rad; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
  ctx.closePath();
}

export const fx = {
  shake(m: number) { shakeAmt = Math.min(22, shakeAmt + m); },
  burst(x: number, y: number, opts: { colors?: string[]; emojis?: string[]; count?: number; power?: number } = {}) {
    const colors = opts.colors ?? PALETTE; const count = opts.count ?? 16; const power = opts.power ?? 1;
    for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2; const sp = (2 + Math.random() * 5) * power; const useEmoji = opts.emojis && Math.random() < 0.35; push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5 * power, life: 0, max: 32 + Math.random() * 30, size: useEmoji ? 20 + Math.random() * 14 : 3.5 + Math.random() * 5.5, color: colors[(Math.random() * colors.length) | 0], kind: useEmoji ? "emoji" : Math.random() < 0.3 ? "star" : "dot", rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, g: 0.13, drag: 0.965, emoji: useEmoji ? opts.emojis![(Math.random() * opts.emojis!.length) | 0] : undefined }); }
  },
  burstAt(el: Element | null | undefined, opts?: { colors?: string[]; emojis?: string[]; count?: number; power?: number }) { if (!el) return; const r = el.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, opts); },
  floatText(x: number, y: number, text: string, color = "#fff7e2", size = 26) { push({ x, y, vx: 0, vy: -1.6, life: 0, max: 58, size, color, kind: "text", rot: 0, vr: 0, g: 0, drag: 1, text }); },
  textAt(el: Element | null | undefined, text: string, color = "#fff7e2", size = 26) { if (!el) return; const r = el.getBoundingClientRect(); fx.floatText(r.left + r.width / 2, r.top + r.height * 0.35, text, color, size); },
  confetti() { const w = window.innerWidth; for (let i = 0; i < 90; i++) push({ x: Math.random() * w, y: -12 - Math.random() * 60, vx: (Math.random() - 0.5) * 3.2, vy: 1.6 + Math.random() * 2.6, life: 0, max: 130 + Math.random() * 90, size: 5 + Math.random() * 7, color: PALETTE[(Math.random() * PALETTE.length) | 0], kind: "confetti", rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, g: 0.04, drag: 0.996 }); },
};

function draw(ctx: CanvasRenderingContext2D, p: P, alpha: number) {
  ctx.globalAlpha = Math.min(1, alpha * 1.4);
  if (p.kind === "dot") { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.5), 0, 6.283); ctx.fill(); }
  else if (p.kind === "star") { ctx.fillStyle = p.color; starPath(ctx, p.x, p.y, p.size * 1.4 * alpha + 2, p.rot); ctx.fill(); }
  else if (p.kind === "confetti") { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); }
  else if (p.kind === "emoji" && p.emoji) { ctx.font = `${p.size}px "Nunito", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = alpha; ctx.fillText(p.emoji, p.x, p.y); }
  else if (p.kind === "text" && p.text) { ctx.font = `600 ${p.size}px Fredoka, "Nunito", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(71,40,26,0.85)"; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y); }
  ctx.globalAlpha = 1;
}

export function FxLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return; const ctx = cvs.getContext("2d"); rootEl = document.getElementById("shake-root");
    let w = 0, h = 0;
    const resize = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); w = window.innerWidth; h = window.innerHeight; cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr); cvs.style.width = w + "px"; cvs.style.height = h + "px"; if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    let raf = 0;
    const step = () => {
      if (ctx && parts.length > 0) { ctx.clearRect(0, 0, w, h); for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life++; if (p.life >= p.max || p.y > h + 40) { parts.splice(i, 1); continue; } p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy; p.rot += p.vr; draw(ctx, p, 1 - p.life / p.max); } if (parts.length === 0) ctx.clearRect(0, 0, w, h); }
      if (shakeAmt > 0.4) { const x = (Math.random() * 2 - 1) * shakeAmt; const y = (Math.random() * 2 - 1) * shakeAmt; shakeAmt *= 0.85; if (rootEl) rootEl.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; } else if (shakeAmt !== 0) { shakeAmt = 0; if (rootEl) rootEl.style.transform = ""; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); if (rootEl) rootEl.style.transform = ""; };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" aria-hidden />;
}
