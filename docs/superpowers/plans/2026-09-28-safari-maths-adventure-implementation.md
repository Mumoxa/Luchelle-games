# Safari Maths Adventure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Safari Maths into a mobile-first Grade 3 campaign with 12 worlds, 96 missions, 15+ puzzle families, validated procedural content, persistent progress, Hint/Skip recovery, Quick Play, and production QA.

**Architecture:** Preserve the existing React/Vite/Tailwind Safari presentation and sound/FX layer. Replace the shallow random `makePuzzle` loop with deterministic validated generators, a campaign/progression layer, versioned local profile storage, and a shared `PuzzleShell`. Puzzle models stay serialisable and independent from React so generation and progression can be tested without a browser.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Web Audio, browser SpeechSynthesis, localStorage, Node 22 built-in test runner, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-09-28-safari-maths-adventure-design.md`

## Global Constraints

- Smartphone portrait is primary; fully usable at 360 px CSS width.
- No required mechanic depends on hover or keyboard.
- Touch targets should normally be at least 44×44 CSS px; normal controls use `touch-action: manipulation`.
- Every puzzle has Hint and Skip; Skip costs no life, gives no points, resets streak, and avoids the same family where possible.
- Campaign has 12 worlds × 8 missions (7 regular + 1 boss), at least 500 configured first-run interactions, and at least 15 interaction families.
- Campaign never hard-blocks on failure; zero hearts enables Support Mode.
- Procedural puzzles validate before rendering; invalid instances regenerate then fall back safely.
- Full validation gate exercises at least 10,000 generated puzzle instances.
- Profile storage key is `safari-maths-profile-v2`; storage failure never blocks play.
- Keep the Safari identity, celebratory FX, score/streak feedback and GitHub Pages deployment.
- UI/UX follows UI UX Pro Max priorities: accessibility, touch/interaction, performance, consistent style, responsive layout, readable type, reduced motion and safe areas.

## Review Focus

1. A malformed generator never exposes an impossible puzzle.
2. Repeated taps cannot double-score or double-advance.
3. Reload/resume never corrupts campaign progress.
4. Corrupt/unavailable localStorage falls back to an in-memory profile.
5. 360×640 portrait never requires horizontal scrolling and keeps primary controls reachable.

---

### Task 1: Deterministic puzzle engine and validation

**Files:**
- Create: `src/puzzles/types.ts`
- Create: `src/puzzles/rng.ts`
- Create: `src/puzzles/validation.ts`
- Create: `src/puzzles/registry.ts`
- Create: `src/puzzles/engine.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `createRng(seed)` and `generatePuzzle(request)`.
- Produces shared puzzle model types and `validatePuzzle(model)`.

- [ ] Write engine tests first: deterministic seed, malformed option sets rejected, empty Sudoku symbols rejected, fallback after five failed seeds.
- [ ] Run focused test and observe RED.
- [ ] Implement RNG, registry and validation pipeline.
- [ ] Run focused test and full logic suite GREEN.
- [ ] Commit `feat: add validated deterministic puzzle engine`.

### Task 2: Campaign, missions, progression and profile persistence

**Files:**
- Create: `src/campaign/worlds.ts`
- Create: `src/campaign/progression.ts`
- Create: `src/campaign/mastery.ts`
- Create: `src/campaign/campaign.test.ts`
- Create: `src/storage/profile.ts`
- Create: `src/storage/profile.test.ts`

**Interfaces:**
- Produces `WORLDS`, `getMission`, `isMissionUnlocked`, `applyMissionResult`, `createDefaultProfile`, `loadProfile`, `saveProfile`, `recordSkillAttempt`.

- [ ] Write tests first for 12×8 structure, boss unlock, world unlock, stars, support mode, storage repair/fallback and mastery updates.
- [ ] Observe RED.
- [ ] Implement campaign/progression/mastery/profile modules.
- [ ] Run tests GREEN.
- [ ] Commit `feat: add campaign progression and persistent profile`.

### Task 3: Expand puzzle catalogue to 15+ families

**Files:**
- Create: `src/puzzles/generators/core.ts`
- Create: `src/puzzles/generators/logic.ts`
- Create: `src/puzzles/generators/measurement.ts`
- Create: `src/puzzles/generators/data.ts`
- Create: `src/puzzles/generators/generators.test.ts`
- Create: `src/puzzles/bulk.test.ts`

**Interfaces:**
- Registers at least: count, choice, number-line, order, place-value, market, clock, pattern, maze, sudoku, fractions, shapes, grouping, data, word-problem.

- [ ] Write generator invariant tests first, including known-valid 3×3/4×4 fruit logic and reachable mazes.
- [ ] Observe RED.
- [ ] Implement generators and registry entries with hints and skill/tier metadata.
- [ ] Add bulk test generating 10,000 instances across seeds/tiers.
- [ ] Run focused + bulk tests GREEN.
- [ ] Commit `feat: expand validated Grade 3 puzzle catalogue`.

### Task 4: Campaign UI, shared PuzzleShell and mobile-first design system

**Files:**
- Create: `src/components/HomeHub.tsx`
- Create: `src/components/WorldMap.tsx`
- Create: `src/components/MissionRunner.tsx`
- Create: `src/components/MissionSummary.tsx`
- Create: `src/components/PuzzleShell.tsx`
- Create: `src/components/PuzzleRenderer.tsx`
- Create: `src/components/puzzles/InteractivePuzzles.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `src/components/Hud.tsx`
- Reuse: `src/game/audio.ts`, `src/game/fx.tsx`, `src/components/icons.tsx`, `src/components/SceneBg.tsx`

**Interfaces:**
- `MissionRunner` consumes campaign/profile APIs and `generatePuzzle`.
- `PuzzleShell` standardises Hint/Skip/read-aloud/progress/feedback.
- `PuzzleRenderer` maps serialisable puzzle models to touch-first interactions.

- [ ] Implement UI only after engine/campaign logic is green.
- [ ] Apply UI UX Pro Max: semantic tokens, 4/8 spacing rhythm, stable press feedback, safe areas, 44px targets, readable type, reduced motion, no structural emoji icons.
- [ ] Ensure tap-select alternatives for drag/gesture-like puzzles.
- [ ] Add Continue Adventure, World Map, Quick Play and Practice entry points.
- [ ] Commit `feat: build mobile Safari Maths campaign experience`.

### Task 5: Resilience, session resume, read-aloud and anti-blocking behaviour

**Files:**
- Modify: `src/components/MissionRunner.tsx`
- Modify: `src/components/PuzzleShell.tsx`
- Modify: `src/storage/profile.ts`
- Create: `src/game/speech.ts`
- Create: `src/campaign/session.test.ts`

- [ ] Write tests first for skip semantics, duplicate outcome suppression, session resume and zero-heart Support Mode.
- [ ] Observe RED.
- [ ] Implement one-shot outcome guard, saved session snapshot, speech synthesis wrapper and explicit recovery paths.
- [ ] Run all logic tests GREEN.
- [ ] Commit `fix: harden mission recovery and accessibility`.

### Task 6: CI, QA, live verification and release

**Files:**
- Modify: `.github/workflows/pages.yml`
- Create: `docs/qa/safari-maths-release-report.md`

- [ ] Make CI run `npm test` before `npm run build`.
- [ ] Push branch and require green tests/build.
- [ ] Run live/browser QA on representative journeys: start → mission → success/wrong/hint/skip → summary → next mission; Sudoku placement/erase; maze reachability; reload/resume; Quick Play.
- [ ] Check mobile widths 320, 360, 375, 390, 393, 412 and 430 px plus tablet/desktop; verify no horizontal overflow and safe-area/touch behaviour.
- [ ] Check reduced motion, labels/focus, console/runtime errors and production page load.
- [ ] Fix any critical/important findings and rerun tests/build/browser verification.
- [ ] Fast-forward `main` to the verified feature commit and confirm GitHub Pages deployment succeeds.
- [ ] Write final QA report with bugs found/fixed, UX/mobile improvements, tests, remaining risks and verification evidence.
