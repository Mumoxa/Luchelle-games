# Safari Maths Adventure — Expansion Design

Date: 2026-09-28  
Repository: `Mumoxa/Luchelle-games`  
Primary platform: smartphone web, portrait-first  
Primary learner: Grade 3  
Secondary mode: Little Learner / Kiddo

## Purpose

The current Safari Maths game has an appealing visual shell and several useful mechanics, but it can be exhausted in a few minutes. This expansion turns it into a substantial learning adventure that can be played over many sessions while remaining simple enough for a child to use independently on a smartphone.

Success means:

- roughly 500–650 puzzle interactions before first-time campaign completion;
- procedural variation so replay does not feel identical;
- persistent progress across visits on the same device;
- no malformed puzzle can trap the learner because Hint and Skip remain available;
- all required interactions work at 360–430 px portrait widths;
- the experience still feels like a game, not a worksheet.

## Product structure

The expanded game has four entry modes:

1. **Continue Adventure** — resume the Grade 3 campaign at the next incomplete mission.
2. **World Map** — select any unlocked world/mission.
3. **Quick Play** — effectively endless mixed practice using unlocked skills.
4. **Practice a Skill** — select a curriculum area directly.

Little Learner remains a separate simplified mode that reuses the puzzle engine but not the Grade 3 campaign progression.

## Campaign scale

The Grade 3 campaign contains **12 worlds × 8 missions**. Each world has **7 regular missions plus 1 Boss mission**. A normal mission contains 5–7 interactions, typically six. This produces about 576 configured first-run interactions before retries, bonus challenges and replay.

| World | Theme | Main skills |
|---|---|---|
| 1 | Lion Plains | counting, number bonds, addition |
| 2 | Elephant River | subtraction, comparing, number lines |
| 3 | Monkey Market | money, totals, change, word problems |
| 4 | Giraffe Heights | place value, expanded notation, ordering |
| 5 | Zebra Patterns | number/shape patterns, missing terms |
| 6 | Rhino Ranges | multiplication, equal groups, arrays |
| 7 | Penguin Bay | division, sharing, grouping |
| 8 | Turtle Time | clocks, elapsed time, calendars |
| 9 | Flamingo Shapes | 2D/3D shapes, symmetry, fractions |
| 10 | Meerkat Measure | length, mass, capacity, estimation |
| 11 | Leopard Logic | Sudoku/Latin logic, deduction, sequences |
| 12 | Safari Championship | mixed Grade 3 mastery |

Previously completed worlds remain replayable.

## Mission, boss, stars and progression

A regular mission should last about 3–7 minutes and normally contains four standard curriculum puzzles, one alternate-mechanic puzzle and one finale challenge.

Each mission offers up to three stars:

- **Completion** — finish the mission.
- **Accuracy** — meet the initial 80% accuracy target.
- **Mastery** — complete a bonus condition such as no hints or a streak.

Stars reward replay but do not permanently block progress.

Progression rules are explicit:

- Regular missions 1–7 are available within the current unlocked world.
- The Boss mission unlocks after any **5 of the 7 regular missions** are completed.
- The next world unlocks after the Boss is completed **and at least 6 of the 8 missions in the current world are complete in total**.
- Remaining missions can always be revisited later for stars and mastery.

## Failure, Hint and Skip

Campaign play no longer uses a hard game-over loop.

- Each mission starts with three hearts.
- A wrong attempt removes one heart and resets the streak.
- Reaching zero hearts switches the mission into Support Mode instead of ending it. Hints become more prominent and score bonuses are reduced, but the learner can still finish.
- Hint is available on every puzzle and teaches the method rather than immediately revealing the answer.
- Skip is always visible in the puzzle header.

Skipping costs no life, gives no points, resets the streak, counts as skipped for mission mastery, and loads a different puzzle family where possible. The same generated puzzle instance must not be repeated immediately.

## Puzzle families

The engine supports at least 15 distinct interaction families:

1. Tap/count objects
2. Multiple choice
3. Number-line jumping
4. Order / compare
5. Place-value builder
6. Market / money
7. Clock
8. Pattern Parade
9. Math Maze
10. Logic Grid / Fruit Sudoku
11. Fractions
12. Shapes and symmetry
13. Sharing / grouping
14. Data / pictograph / bar-chart challenge
15. Short word problem

Multiple choice remains a useful fallback but must not dominate the game.

### Maze

Support two variants:

- navigation maze — guide the character through a generated valid maze;
- answer maze — move to a target associated with the correct maths answer, borrowing the strongest idea from the attached game.

All generated mazes are validated for reachability before rendering.

### Logic / Sudoku

Rebuild the current Sudoku implementation around known-valid solution templates.

Progression:

- early 3×3 Latin-style fruit logic: one of each symbol per row and column;
- later 4×4 Latin logic;
- optional 4×4 block constraints only when the instruction explicitly teaches them.

Interaction must support both “tap cell then fruit” and “tap fruit then cell”. Fixed and editable cells must be visually distinct. Erase, Hint and Skip remain available. Every required symbol must be visible and non-empty.

## Difficulty model

Difficulty is conceptual, not merely larger numbers. Skills can use up to six tiers:

1. Recognise
2. Apply one familiar operation
3. Bridge across tens/hundreds or mixed representations
4. Missing value / reverse operation
5. Context / word problem
6. Combined two-step challenge

Example addition progression: `8 + 6` → `27 + 14` → bridging tens → `__ + 38 = 72` → one-step story → two-step story.

The campaign chooses allowed tiers; Quick Play adapts near the learner’s demonstrated level.

## Curriculum model

Internally, skills map to the five South African Foundation Phase mathematics content areas represented in the attached version:

- Numbers, Operations and Relationships
- Patterns, Functions and Algebra
- Space and Shape
- Measurement
- Data Handling

World names are the child-facing layer. Every generated puzzle carries domain, skill ID, difficulty tier, puzzle family, prompt/instructions, correct answer/state, validation metadata and optional hint data.

## Persistent progress and mastery

Use a versioned local profile, initially `safari-maths-profile-v2`, storing:

- unlocked worlds;
- mission completion and stars;
- total attempted/correct/wrong/skipped;
- best streak and cumulative score;
- badges;
- settings including sound and read-aloud;
- per-skill attempts, first-attempt accuracy, hints, skips, rolling accuracy, highest demonstrated tier and last-practised time.

The child-facing dashboard uses friendly language rather than grades. Quick Play gives a modest weight boost to weak or stale skills without repeatedly hammering a single weak area.

Existing high scores may be migrated as history, but old sessions cannot be treated as completed campaign missions because the previous version did not store that information.

Storage failure must never block play. If localStorage is unavailable or malformed, start a clean temporary profile and show only a small non-blocking warning.

## Architecture

Split the current coupled game into focused modules.

### Campaign

- `src/campaign/worlds.ts` — worlds, missions and unlock requirements
- `src/campaign/progression.ts` — mission results, stars and unlocks
- `src/campaign/mastery.ts` — skill performance and adaptive weights

### Puzzle engine

- `src/puzzles/types.ts` — shared puzzle contracts
- `src/puzzles/registry.ts` — generator/renderer registry
- `src/puzzles/generators/*` — small generators by skill/family
- `src/puzzles/validators/*` — invariant validation

Generators receive a deterministic context containing mode, skill ID, tier, seed and recent puzzle IDs, and return a serialisable puzzle model independent of React rendering.

### UI

Add focused components such as `WorldMap`, `MissionSelect`, `MissionSummary`, `ProgressDashboard` and `PuzzleShell`. `PuzzleShell` owns common controls: mission progress, Hint, Skip, subject label, accessibility/read-aloud and feedback. Puzzle components own only their local interaction state and report standardised outcomes upward.

### Persistence

`src/storage/profile.ts` owns load/save/migrate/repair logic. React components do not call localStorage directly.

### Audio/read-aloud

Retain lightweight Web Audio effects. Use browser speech synthesis for optional read-aloud where supported and degrade gracefully when not available.

### Data flow

The normal campaign flow is:

1. Home/World Map selects a mission.
2. `MissionRunner` reads the mission definition and chooses the next skill/tier/puzzle family.
3. The puzzle registry calls the matching seeded generator.
4. The validator accepts the puzzle or regenerates/falls back before anything is shown.
5. `PuzzleShell` renders the puzzle component and common Hint/Skip/status controls.
6. The puzzle reports a standard result (`correct`, `wrong`, `hint`, or `skip`) upward.
7. `MissionRunner` updates hearts, streak, mission state and score.
8. Mastery/progression modules update the learner profile through the storage layer.
9. The next challenge or mission summary is selected from the updated state.

Puzzle components do not directly unlock worlds, write storage, or own global score/progression.

## Generation and validation

Use seeded randomness, not raw `Math.random()` inside generators. Stable seeds make bugs reproducible, enable deterministic tests and support reliable session resume.

General invariants:

- correct answer/state exists;
- options contain no duplicates;
- exactly one answer is correct where applicable;
- prompts contain no `NaN`, `undefined`, empty required symbols or impossible values;
- skill/tier numeric ranges are respected;
- recent puzzle signatures are avoided where practical.

Special validation:

- arithmetic answers must match generated operands;
- exact division must produce integer answers;
- money is calculated in integer cents and formatted consistently;
- clock hands and textual answers derive from the same normalized time;
- maze start/goal must be connected;
- Sudoku givens must match a valid solution and every declared symbol must be visible;
- editable Sudoku cells must accept replacement/erase.

If validation fails, retry a small fixed number of seeds, then fall back to a known-safe puzzle in the same domain. A generator exception must never crash the whole game.

## Mobile-first requirements

Primary target is smartphone portrait.

- fully usable at 360 px CSS width;
- no horizontal scrolling;
- required controls remain inside safe areas;
- touch targets approximately 44×44 px or larger;
- normal controls use `touch-action: manipulation`;
- `touch-action: none` is reserved for genuine gesture surfaces such as swipe mazes;
- boards size from both viewport width and available height;
- no required mechanic depends on hover or keyboard;
- keyboard remains an optional desktop enhancement;
- readable without pinch zoom;
- portrait fully supported, landscape optional.

## Accessibility and independence

- concise instructions for every new mechanic;
- first-use coach mark/demo for unfamiliar puzzle families;
- read-aloud for word problems and instructions;
- visual feedback in addition to sound;
- colour is not the sole state indicator;
- ARIA labels on icon controls and board cells where practical;
- reduced-motion support preserves functional feedback while reducing decoration.

## Quick Play and Practice

Quick Play is effectively unbounded through procedural generation. Selection rules:

1. avoid immediately repeating the previous puzzle family when possible;
2. maintain domain variety;
3. slightly favour weak or stale skills;
4. avoid repeated frustration on a single skill;
5. stay near demonstrated tier, with occasional confidence and stretch questions.

Practice a Skill stays within the selected skill/domain instead of using adaptive mixing.

## Boss challenges

Bosses are configured missions, not a separate hard-coded engine. They combine multiple puzzle families with stronger framing and larger completion celebrations.

Examples:

- Monkey Market: select items, total the basket, calculate change.
- Turtle Time: read departure time, add duration, identify arrival time.
- Safari Championship: mixed multi-step challenges across prior worlds.

## Little Learner

Little Learner reuses the engine with a separate skill catalogue: number recognition, counting, simple addition/subtraction, repeating patterns, basic shapes, simple time/measurement and 3×3 logic only. Grade 3 remains the primary product focus.

## Testing strategy

### Unit tests

Test seeded RNG, pure generators, validators, progression, mastery updates, formatting and storage migration.

### Bulk/property tests

Generate thousands of puzzles across representative seeds and tiers. Minimum release gate: **10,000 generated puzzle instances per full automated test run without invariant failure**. Sudoku, maze, money and clock receive dedicated bulk coverage.

### Interaction tests

Cover touch interactions, Sudoku selection/replacement, Hint, Skip, maze controls, mission completion and save/resume.

### Regression tests

Explicitly preserve fixes for:

- Sudoku cannot contain an empty required symbol;
- editable Sudoku cells accept placement;
- Skip never costs a life;
- Skip avoids the immediately skipped family where alternatives exist;
- maze goals are reachable.

### Browser verification

Before release: build succeeds; campaign starts; at least one mission completes; Skip advances; 360 px viewport has no horizontal overflow; representative puzzle families work; saved progress survives reload.

## Migration from the current game

Preserve:

- Safari visual identity;
- sound and celebratory FX;
- score/streak feedback;
- responsive card style;
- useful Maze, Clock, Shape and Tap concepts;
- permanent Skip;
- GitHub Pages deployment.

Replace/restructure:

- global random `makePuzzle` progression;
- shallow tiering tied mainly to level number;
- hard game-over session model;
- score-only persistence;
- monolithic content generator;
- current Sudoku generator/interaction with the validated logic engine.

Incorporate from the attached version:

- five CAPS content domains;
- Pattern Parade;
- answer-target Math Maze;
- topic-oriented practice;
- read-aloud concept;
- known-valid Sudoku templates;
- local score/profile continuity ideas.

## Rollout sequence

1. **Foundations** — seeded RNG, puzzle contracts/registry, validators, versioned profile, campaign definitions, tests.
2. **Campaign shell** — home, world map, mission runner, stars, hearts, Hint/Skip, save/resume.
3. **Curriculum expansion** — adapt existing families and add number line, compare/order, place value, money, grouping, data and word problems.
4. **Logic and maze rebuild** — validated 3×3/4×4 logic, validated mazes, answer-maze variant, regression tests.
5. **Mastery and replay** — adaptive Quick Play, Practice a Skill, dashboard, badges and Boss framing.
6. **Mobile polish/release** — 360–430 px device matrix, safe areas, read-aloud, reduced motion, bulk-generation gate and production smoke test.

## Acceptance criteria

The expansion is complete when:

1. 12 worlds and 96 mission definitions exist.
2. The first-run campaign contains at least 500 configured interactions.
3. At least 15 distinct interaction families are available across the campaign.
4. Grade 3 content spans all five Foundation Phase maths domains.
5. Progress, stars, mastery and settings persist locally and survive reload.
6. Continue Adventure resumes the correct next mission.
7. Hint and Skip are available on every puzzle.
8. Skip cannot cost a life or block progression.
9. Logic/Sudoku and maze generators pass validation and regression tests.
10. A full automated run validates at least 10,000 generated puzzle instances.
11. The game is fully usable at 360 px portrait width without horizontal overflow.
12. No required interaction depends on keyboard or hover.
13. Quick Play is effectively unbounded through procedural generation/adaptive selection.
14. GitHub Pages deploys successfully and passes a representative mobile browser smoke test.

## Non-goals

This expansion does not require user accounts, cloud login, multiplayer, a hosted parent/teacher dashboard, analytics collection, payments, live AI-generated questions or cross-device sync. Those can be considered later without blocking the core learning game.