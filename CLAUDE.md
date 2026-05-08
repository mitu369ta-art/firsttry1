# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install all dependencies (first time setup)
npm run dev        # Start dev server → http://localhost:5173
npm run build      # Type-check with tsc, then Vite production build
npm run preview    # Serve the production build locally
```

No test suite is configured. Verify changes by running the dev server and playing the game.

## Tech Stack

| Tool | Version |
|------|---------|
| React | 18.3.1 |
| TypeScript | 5.6.3 (strict mode) |
| Vite | 5.4.10 |
| Tailwind CSS | 3.4.14 (utility classes largely unused — styling is inline) |

Tailwind is installed but almost all styling uses inline `style` props. Do not add Tailwind classes expecting them to be the primary style mechanism.

## Repository Layout

```
src/
  game/
    types.ts       # All shared types (no React dependency)
    constants.ts   # Board dimensions, timing, color list
    logic.ts       # All game logic — pure functions only
  hooks/
    useGame.ts     # React hook: game loop + keyboard input
  components/
    Board.tsx      # 6×13 grid renderer
    PuyoCell.tsx   # Single puyo circle with face/glow/pop animation
    NextPiece.tsx  # Preview panel for next two pieces
    ScorePanel.tsx # Left panel: score, level, chain display
  App.tsx          # Root layout + game-over overlay
  main.tsx         # React DOM entry point
  index.css        # Global resets + 3 CSS keyframe animations
index.html         # Loads Google Fonts (Orbitron, Noto Sans JP)
vercel.json        # Minimal Vercel deploy config (name only)
```

## Architecture

### Game Logic — `src/game/`

Pure functions only — zero React imports. All state is represented by `GameState` (immutable updates via spread).

**`types.ts` — key types:**
```ts
type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';
type Cell = PuyoColor | null;
type Board = Cell[][];          // board[row][col], row 0 = top, row 12 = bottom
type GamePhase = 'playing' | 'popping' | 'dropping' | 'gameover';

interface Piece {
  pivotRow, pivotCol: number;
  pivotColor, satelliteColor: PuyoColor;
  rotation: 0 | 1 | 2 | 3;    // 0=sat above, 1=right, 2=below, 3=left
}

interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPieces: [Piece, Piece];  // two lookahead pieces
  poppingCells: Set<string>;   // "row,col" keys
  score, level, totalPopped, chainCount, maxChain: number;
  phase: GamePhase;
  fallTimer, popTimer, dropTimer: number;  // countdown ticks
}
```

**`constants.ts` — key values:**
```ts
BOARD_COLS = 6, BOARD_ROWS = 13
SPAWN_ROW = 1, SPAWN_COL = 2
FALL_BASE_TICKS = 8   // 800ms per row at level 1
FALL_MIN_TICKS = 1    // 100ms minimum (highest speed)
POP_TICKS = 5         // 500ms pop animation hold
DROP_TICKS = 2        // 200ms grace period after lock before group check
MIN_POP_GROUP = 4     // minimum connected group to pop
LEVEL_UP_EVERY = 30   // puyos popped per level
PUYO_COLORS = ['red', 'blue', 'green', 'yellow', 'purple']
SATELLITE_OFFSETS = [[-1,0], [0,1], [1,0], [0,-1]]  // per rotation
```

**`logic.ts` — exported API:**
| Export | Purpose |
|--------|---------|
| `createInitialState()` | Fresh `GameState` |
| `tick(state)` | Advance one 100ms tick; drives phase transitions |
| `handleMoveLeft/Right(s)` | Horizontal movement |
| `handleSoftDrop(s)` | Move down one row, reset fall timer |
| `handleHardDrop(s)` | Instant lock, skip DROP_TICKS grace |
| `handleRotateCW/CCW(s)` | Rotate ±1 with wall-kick |
| `getSatellitePos(piece)` | `[row, col]` of satellite cell |
| `getGhostPiece(piece, board)` | Shadow piece at landing position |
| `findGroups(board)` | BFS; returns `Set<string>[]` of poppable groups (size ≥ 4) |
| `getFallTicks(level)` | `max(1, 8 - (level-1))` |

### Phase State Machine

```
'playing'  → auto-fall each FALL_BASE_TICKS ticks; on landing → lock → 'dropping'
'dropping' → wait DROP_TICKS; run findGroups → 'popping' (if groups) | 'playing' (spawn next)
'popping'  → wait POP_TICKS; apply pops + gravity → re-check (chain) | 'playing' (spawn next)
'gameover' → tick() is a no-op; restart() resets via createInitialState()
```

All timers count **down** to zero (decrement each tick). `fallTimer`, `popTimer`, `dropTimer` all work this way.

### Scoring Formula

```ts
chainBonus = chain > 1 ? (chain - 1) * 50 : 0
sizeBonus  = popped >= 8 ? 20 : popped >= 6 ? 10 : 0
points     = (10 * popped + chainBonus + sizeBonus) * level
```

### Game Loop — `src/hooks/useGame.ts`

`useGame()` runs `setInterval(100ms)` calling `tick()`. Input handlers bypass the interval and call `apply(fn)` directly for zero-latency response.

**Dual-ref pattern** — state is held in both:
- `stateRef` (a `useRef`) — read synchronously inside callbacks to avoid stale closures
- `renderState` (a `useState`) — triggers React re-renders

The `apply(fn)` helper updates both atomically:
```ts
const apply = (fn) => {
  stateRef.current = fn(stateRef.current);
  setRenderState({ ...stateRef.current });
};
```

Never read from `renderState` inside event handlers or the interval — always use `stateRef.current`.

### Components — `src/components/`

**`Board.tsx`**
- Cell size: 44px, gap: 2px
- Builds a `display[row][col]` array merging board cells, ghost piece, and active piece
- Ghost is shown only when it would actually be lower than the current piece
- Active piece overwrites ghost at the same position

**`PuyoCell.tsx`**
- Props: `color`, `isPopping`, `isGhost`, `size` (default 40px)
- `connections` prop is defined in the interface but not yet used (reserved for future blob-shape rendering)
- Ghost: transparent fill, colored border at 35% opacity
- Pop: CSS `puyoPop` animation (scale 1→1.5→0, 500ms)
- Each color has `grad` (radial-gradient), `glow` (box-shadow color), `highlight` values

**`NextPiece.tsx`**
- Always renders in rotation=0 orientation: satellite on top, pivot below
- Two instances shown: `nextPieces[0]` (NEXT, size=36) and `nextPieces[1]` (2ND, size=28)

**`ScorePanel.tsx`**
- `chainCount > 0` renders a `chainPulse` animated chain counter
- `maxChain >= 3` renders MAX CHAIN value in gold with glow

### CSS Animations (`src/index.css`)

| Name | Trigger | Description |
|------|---------|-------------|
| `puyoPop` | `isPopping` prop on PuyoCell | Scale 1→1.5→0 with brightness flash, 500ms forwards |
| `chainPulse` | `chainCount > 0` in ScorePanel | Scale-in bounce, 400ms |
| `fadeIn` | Game-over overlay | Opacity 0→1, 300ms |

### Coordinate System & Rotation

- `board[row][col]` — row 0 is the **top** of the board, row 12 is the **bottom**
- Rotation values: `0=satellite above, 1=right, 2=below, 3=left`
- Spawn: pivot at `(row=1, col=2)`, satellite at `(row=0, col=2)` (rotation=0)
- Wall-kick: after rotation collision, try `col±1` before giving up

### Fonts

Loaded from Google Fonts in `index.html`:
- **Orbitron** (700) — scores, labels, numeric displays
- **Noto Sans JP** (400, 700) — Japanese text, UI body

---

## Core Game Features

### Controls
| Key | Action |
|-----|--------|
| ← → | Move left / right |
| Z / z | Rotate counter-clockwise |
| X / x | Rotate clockwise |
| ↓ | Soft drop (one row) |
| Space | Hard drop (instant lock) |

### Piece Mechanics
- Two-puyo pairs (pivot + satellite)
- 5 colors: red, blue, green, yellow, purple; chosen randomly per piece
- Wall-kick on rotation (±1 column)
- Ghost piece shows landing position

### Matching & Chains
- BFS flood-fill groups 4+ same-color puyos
- Popped cells removed; gravity applied column-by-column
- Chain continues if new groups form after gravity
- Chain/size bonuses multiply by current level

### Game Over
- Triggered when `nextPieces[0]` collides with the board at spawn position before being placed

---

## Deployment

- Deployed on Vercel; `vercel.json` only sets `name: "firsttry1"`
- No server-side code; purely static SPA
- `npm run build` emits to `dist/` (Vite default)

---

## Development Phases

| Phase | Content | Status |
|-------|---------|--------|
| Phase 1 | Core engine, single-player, modern UI | ✅ Complete |
| Phase 2 | AI battle mode, nuisance puyos (おじゃまぷよ), high-score persistence | Not started |
| Phase 3 | Mobile/touch support, BGM/SE, enhanced effects | Not started |

### Phase 2 Notes (for future implementation)
- Will need a second `Board` + `GameState` instance for the CPU player
- Nuisance puyo count formula: `Math.floor(chainCount * chainCount / 2)` (standard Puyo rules)
- High scores should persist to `localStorage` keyed by game mode
- AI decision loop should run as a separate `setInterval` or be integrated into `tick()`

---

## Key Conventions

- **No side effects in game logic** — `src/game/` must stay pure functions; all randomness is via `Math.random()` at piece creation only
- **Immutable state updates** — always spread into a new object; never mutate `GameState` fields directly
- **Tick-based timers** — all durations are integer tick counts, not milliseconds; 1 tick = 100ms
- **String keys for sets** — board cell coordinates stored as `"row,col"` strings in `Set<string>`
- **TypeScript strict** — `strict: true` in tsconfig; no implicit `any`, no non-null assertions without evidence
- **Inline styles** — component styling uses `style` props; Tailwind is present but not the primary mechanism
