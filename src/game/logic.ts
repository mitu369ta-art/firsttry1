import type { Board, GameState, Piece, PuyoColor } from './types';
import {
  BOARD_COLS, BOARD_ROWS, DROP_TICKS, FALL_BASE_TICKS, FALL_MIN_TICKS,
  LEVEL_UP_EVERY, MIN_POP_GROUP, POP_TICKS, PUYO_COLORS,
  SATELLITE_OFFSETS, SPAWN_COL, SPAWN_ROW,
} from './constants';

// ── Board ──────────────────────────────────────────────────────────────────

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () => Array<PuyoColor | null>(BOARD_COLS).fill(null));
}

function copyBoard(board: Board): Board {
  return board.map(row => [...row]);
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

// ── Piece helpers ──────────────────────────────────────────────────────────

export function getSatellitePos(piece: Piece): [number, number] {
  const [dr, dc] = SATELLITE_OFFSETS[piece.rotation];
  return [piece.pivotRow + dr, piece.pivotCol + dc];
}

function randomColor(): PuyoColor {
  return PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)];
}

function createPiece(): Piece {
  return {
    pivotRow: SPAWN_ROW,
    pivotCol: SPAWN_COL,
    pivotColor: randomColor(),
    satelliteColor: randomColor(),
    rotation: 0,
  };
}

function pieceCollides(piece: Piece, board: Board): boolean {
  const [sr, sc] = getSatellitePos(piece);
  const cells: [number, number][] = [[piece.pivotRow, piece.pivotCol], [sr, sc]];
  return cells.some(([r, c]) => !inBounds(r, c) || board[r][c] !== null);
}

// ── Movement ───────────────────────────────────────────────────────────────

function tryMove(piece: Piece, board: Board, dr: number, dc: number): Piece | null {
  const moved = { ...piece, pivotRow: piece.pivotRow + dr, pivotCol: piece.pivotCol + dc };
  return pieceCollides(moved, board) ? null : moved;
}

function tryRotate(piece: Piece, board: Board, dir: 1 | -1): Piece | null {
  const newRot = ((piece.rotation + dir + 4) % 4) as 0 | 1 | 2 | 3;
  const rotated = { ...piece, rotation: newRot };
  if (!pieceCollides(rotated, board)) return rotated;

  for (const dc of [-1, 1]) {
    const kicked = { ...rotated, pivotCol: rotated.pivotCol + dc };
    if (!pieceCollides(kicked, board)) return kicked;
  }
  return null;
}

// ── Ghost piece ────────────────────────────────────────────────────────────

export function getGhostPiece(piece: Piece, board: Board): Piece {
  let ghost = piece;
  let next = tryMove(ghost, board, 1, 0);
  while (next) { ghost = next; next = tryMove(ghost, board, 1, 0); }
  return ghost;
}

// ── Locking ────────────────────────────────────────────────────────────────

function lockPiece(piece: Piece, board: Board): Board {
  const [sr, sc] = getSatellitePos(piece);
  const next = copyBoard(board);
  if (inBounds(piece.pivotRow, piece.pivotCol)) next[piece.pivotRow][piece.pivotCol] = piece.pivotColor;
  if (inBounds(sr, sc)) next[sr][sc] = piece.satelliteColor;
  return next;
}

// ── Matching ───────────────────────────────────────────────────────────────

export function findGroups(board: Board): Set<string>[] {
  const visited = new Set<string>();
  const poppable: Set<string>[] = [];

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const key = `${r},${c}`;
      if (visited.has(key) || !board[r][c]) continue;

      const color = board[r][c] as PuyoColor;
      const group = new Set<string>();
      const queue: [number, number][] = [[r, c]];

      while (queue.length) {
        const [cr, cc] = queue.shift()!;
        const ck = `${cr},${cc}`;
        if (visited.has(ck)) continue;
        visited.add(ck);
        group.add(ck);
        for (const [nr, nc] of [[cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]] as [number, number][]) {
          if (inBounds(nr, nc) && !visited.has(`${nr},${nc}`) && board[nr][nc] === color) {
            queue.push([nr, nc]);
          }
        }
      }

      if (group.size >= MIN_POP_GROUP) poppable.push(group);
    }
  }

  return poppable;
}

function applyPops(board: Board, cells: Set<string>): Board {
  const next = copyBoard(board);
  for (const key of cells) {
    const [r, c] = key.split(',').map(Number);
    next[r][c] = null;
  }
  return next;
}

function applyGravity(board: Board): Board {
  const next = createEmptyBoard();
  for (let c = 0; c < BOARD_COLS; c++) {
    let writeRow = BOARD_ROWS - 1;
    for (let r = BOARD_ROWS - 1; r >= 0; r--) {
      if (board[r][c] !== null) { next[writeRow][c] = board[r][c]; writeRow--; }
    }
  }
  return next;
}

// ── Scoring ────────────────────────────────────────────────────────────────

function calcScore(popped: number, chain: number, level: number): number {
  const chainBonus = chain > 1 ? (chain - 1) * 50 : 0;
  const sizeBonus = popped >= 8 ? 20 : popped >= 6 ? 10 : 0;
  return (10 * popped + chainBonus + sizeBonus) * level;
}

export function getFallTicks(level: number): number {
  return Math.max(FALL_MIN_TICKS, FALL_BASE_TICKS - (level - 1));
}

// ── Initial state ──────────────────────────────────────────────────────────

export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPiece: createPiece(),
    nextPieces: [createPiece(), createPiece()],
    poppingCells: new Set<string>(),
    score: 0,
    level: 1,
    totalPopped: 0,
    chainCount: 0,
    maxChain: 0,
    phase: 'playing',
    fallTimer: FALL_BASE_TICKS,
    popTimer: 0,
    dropTimer: 0,
  };
}

// ── Spawn ──────────────────────────────────────────────────────────────────

function spawnNext(state: GameState): GameState {
  const [next1, next2] = state.nextPieces;
  const newPiece = createPiece();
  if (pieceCollides(next1, state.board)) {
    return { ...state, phase: 'gameover', currentPiece: null };
  }
  return {
    ...state,
    currentPiece: next1,
    nextPieces: [next2, newPiece],
    phase: 'playing',
    fallTimer: getFallTicks(state.level),
    chainCount: 0,
    poppingCells: new Set<string>(),
  };
}

function startPopping(state: GameState, groups: Set<string>[], chain: number): GameState {
  const cells = new Set<string>(groups.flatMap(g => [...g]));
  const popped = cells.size;
  const totalPopped = state.totalPopped + popped;
  return {
    ...state,
    poppingCells: cells,
    chainCount: chain,
    maxChain: Math.max(state.maxChain, chain),
    score: state.score + calcScore(popped, chain, state.level),
    totalPopped,
    level: Math.floor(totalPopped / LEVEL_UP_EVERY) + 1,
    phase: 'popping',
    popTimer: POP_TICKS,
  };
}

// ── Main tick ──────────────────────────────────────────────────────────────

export function tick(state: GameState): GameState {
  if (state.phase === 'gameover') return state;

  if (state.phase === 'popping') {
    if (state.popTimer > 0) return { ...state, popTimer: state.popTimer - 1 };
    const afterPop = applyGravity(applyPops(state.board, state.poppingCells));
    const groups = findGroups(afterPop);
    if (groups.length > 0) {
      return startPopping({ ...state, board: afterPop }, groups, state.chainCount + 1);
    }
    return spawnNext({ ...state, board: afterPop });
  }

  if (state.phase === 'dropping') {
    if (state.dropTimer > 0) return { ...state, dropTimer: state.dropTimer - 1 };
    const groups = findGroups(state.board);
    if (groups.length > 0) return startPopping(state, groups, 1);
    return spawnNext(state);
  }

  // 'playing': auto-fall
  if (state.fallTimer > 0) return { ...state, fallTimer: state.fallTimer - 1 };

  const piece = state.currentPiece!;
  const moved = tryMove(piece, state.board, 1, 0);
  if (moved) return { ...state, currentPiece: moved, fallTimer: getFallTicks(state.level) };

  // Lock
  const newBoard = lockPiece(piece, state.board);
  return { ...state, board: newBoard, currentPiece: null, phase: 'dropping', dropTimer: DROP_TICKS };
}

// ── Input handlers ─────────────────────────────────────────────────────────

export function handleMoveLeft(s: GameState): GameState {
  if (s.phase !== 'playing' || !s.currentPiece) return s;
  const moved = tryMove(s.currentPiece, s.board, 0, -1);
  return moved ? { ...s, currentPiece: moved } : s;
}

export function handleMoveRight(s: GameState): GameState {
  if (s.phase !== 'playing' || !s.currentPiece) return s;
  const moved = tryMove(s.currentPiece, s.board, 0, 1);
  return moved ? { ...s, currentPiece: moved } : s;
}

export function handleSoftDrop(s: GameState): GameState {
  if (s.phase !== 'playing' || !s.currentPiece) return s;
  const moved = tryMove(s.currentPiece, s.board, 1, 0);
  if (moved) return { ...s, currentPiece: moved, fallTimer: getFallTicks(s.level) };
  return { ...s, fallTimer: 0 };
}

export function handleHardDrop(s: GameState): GameState {
  if (s.phase !== 'playing' || !s.currentPiece) return s;
  let piece = s.currentPiece;
  let next = tryMove(piece, s.board, 1, 0);
  while (next) { piece = next; next = tryMove(piece, s.board, 1, 0); }
  const newBoard = lockPiece(piece, s.board);
  return { ...s, board: newBoard, currentPiece: null, phase: 'dropping', dropTimer: 0 };
}

export function handleRotateCW(s: GameState): GameState {
  if (s.phase !== 'playing' || !s.currentPiece) return s;
  const rotated = tryRotate(s.currentPiece, s.board, 1);
  return rotated ? { ...s, currentPiece: rotated } : s;
}

export function handleRotateCCW(s: GameState): GameState {
  if (s.phase !== 'playing' || !s.currentPiece) return s;
  const rotated = tryRotate(s.currentPiece, s.board, -1);
  return rotated ? { ...s, currentPiece: rotated } : s;
}
