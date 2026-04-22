import type { PuyoColor } from './types';

export const BOARD_COLS = 6;
export const BOARD_ROWS = 13;
export const SPAWN_ROW = 1;
export const SPAWN_COL = 2;

export const FALL_BASE_TICKS = 8;   // ticks to fall one row at level 1 (×100ms = 800ms)
export const FALL_MIN_TICKS = 1;
export const POP_TICKS = 5;          // 500ms pop animation
export const DROP_TICKS = 2;         // 200ms before checking groups after lock

export const PUYO_COLORS: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
export const MIN_POP_GROUP = 4;
export const LEVEL_UP_EVERY = 30;    // puyos popped to advance level

// Satellite [dRow, dCol] offset relative to pivot for each rotation
export const SATELLITE_OFFSETS: [number, number][] = [
  [-1, 0],  // 0: above
  [0, 1],   // 1: right
  [1, 0],   // 2: below
  [0, -1],  // 3: left
];
