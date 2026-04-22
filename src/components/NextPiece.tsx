import type { Piece } from '../game/types';
import { PuyoCell } from './PuyoCell';

interface NextPieceProps {
  piece: Piece;
  label?: string;
  size?: number;
}

export function NextPiece({ piece, label = 'NEXT', size = 34 }: NextPieceProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        color: '#6666aa',
        fontSize: 10,
        letterSpacing: 3,
        marginBottom: 6,
        fontFamily: 'Orbitron, monospace',
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '10px 14px',
        background: 'rgba(8, 8, 28, 0.85)',
        borderRadius: 10,
        border: '1px solid rgba(100, 120, 255, 0.2)',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 50, 0.5)',
      }}>
        {/* Always show in rotation-0 orientation: satellite on top, pivot below */}
        <PuyoCell color={piece.satelliteColor} size={size} />
        <PuyoCell color={piece.pivotColor} size={size} />
      </div>
    </div>
  );
}
