import type { Cell, PuyoColor } from '../game/types';
import type { GameState } from '../game/types';
import { getSatellitePos, getGhostPiece } from '../game/logic';
import { BOARD_COLS, BOARD_ROWS } from '../game/constants';
import { PuyoCell } from './PuyoCell';

const CELL = 44;
const GAP = 2;

interface BoardProps {
  state: GameState;
}

export function Board({ state }: BoardProps) {
  const { board, currentPiece, poppingCells, phase } = state;

  // Build display layers: [row][col] = { color, isPopping, isGhost }
  const display: { color: Cell; isPopping: boolean; isGhost: boolean }[][] =
    board.map(row => row.map(c => ({ color: c, isPopping: false, isGhost: false })));

  // Mark popping cells
  for (const key of poppingCells) {
    const [r, c] = key.split(',').map(Number);
    if (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
      display[r][c].isPopping = true;
    }
  }

  // Overlay current piece and ghost
  if (currentPiece && phase === 'playing') {
    const ghost = getGhostPiece(currentPiece, board);
    const [gsr, gsc] = getSatellitePos(ghost);
    const [sr, sc] = getSatellitePos(currentPiece);

    // Ghost (only if it's actually lower than the piece)
    if (ghost.pivotRow !== currentPiece.pivotRow || ghost.pivotCol !== currentPiece.pivotCol) {
      if (ghost.pivotRow >= 0 && ghost.pivotRow < BOARD_ROWS) {
        display[ghost.pivotRow][ghost.pivotCol] = { color: currentPiece.pivotColor as PuyoColor, isPopping: false, isGhost: true };
      }
      if (gsr >= 0 && gsr < BOARD_ROWS) {
        display[gsr][gsc] = { color: currentPiece.satelliteColor as PuyoColor, isPopping: false, isGhost: true };
      }
    }

    // Active piece (overwrites ghost if same position)
    if (currentPiece.pivotRow >= 0 && currentPiece.pivotRow < BOARD_ROWS) {
      display[currentPiece.pivotRow][currentPiece.pivotCol] = { color: currentPiece.pivotColor, isPopping: false, isGhost: false };
    }
    if (sr >= 0 && sr < BOARD_ROWS) {
      display[sr][sc] = { color: currentPiece.satelliteColor, isPopping: false, isGhost: false };
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${BOARD_COLS}, ${CELL}px)`,
      gridTemplateRows: `repeat(${BOARD_ROWS}, ${CELL}px)`,
      gap: GAP,
      padding: 10,
      background: 'rgba(8, 8, 28, 0.95)',
      borderRadius: 14,
      border: '1px solid rgba(100, 120, 255, 0.25)',
      boxShadow: '0 0 40px rgba(80, 80, 255, 0.12), inset 0 0 60px rgba(0, 0, 60, 0.6)',
    }}>
      {Array.from({ length: BOARD_ROWS }, (_, r) =>
        Array.from({ length: BOARD_COLS }, (_, c) => {
          const cell = display[r][c];
          return (
            <div
              key={`${r},${c}`}
              style={{
                width: CELL,
                height: CELL,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.015)',
                borderRadius: 6,
              }}
            >
              <PuyoCell
                color={cell.color}
                isPopping={cell.isPopping}
                isGhost={cell.isGhost}
                size={CELL - 6}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
