export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type Cell = PuyoColor | null;
export type Board = Cell[][];  // board[row][col], row 0 = top

export interface Piece {
  pivotRow: number;
  pivotCol: number;
  pivotColor: PuyoColor;
  satelliteColor: PuyoColor;
  rotation: 0 | 1 | 2 | 3;  // 0=sat above, 1=sat right, 2=sat below, 3=sat left
}

export type GamePhase = 'playing' | 'popping' | 'dropping' | 'gameover';

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPieces: [Piece, Piece];
  poppingCells: Set<string>;   // "row,col"
  score: number;
  level: number;
  totalPopped: number;
  chainCount: number;
  maxChain: number;
  phase: GamePhase;
  fallTimer: number;
  popTimer: number;
  dropTimer: number;
}
