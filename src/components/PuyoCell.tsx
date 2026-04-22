import type { PuyoColor } from '../game/types';

interface PuyoCellProps {
  color: PuyoColor | null;
  isPopping?: boolean;
  isGhost?: boolean;
  size?: number;
  connections?: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

const COLORS: Record<PuyoColor, { grad: string; glow: string; highlight: string }> = {
  red:    { grad: 'radial-gradient(circle at 38% 32%, #ff9999, #ff3030 55%, #aa0000)', glow: '#ff2222', highlight: '#ffaaaa' },
  blue:   { grad: 'radial-gradient(circle at 38% 32%, #99bbff, #3366ff 55%, #0033cc)', glow: '#2255ff', highlight: '#aaccff' },
  green:  { grad: 'radial-gradient(circle at 38% 32%, #99ee99, #22cc22 55%, #008800)', glow: '#22cc22', highlight: '#aaffaa' },
  yellow: { grad: 'radial-gradient(circle at 38% 32%, #ffee99, #ffcc00 55%, #cc8800)', glow: '#ffcc00', highlight: '#ffeeaa' },
  purple: { grad: 'radial-gradient(circle at 38% 32%, #cc99ff, #9933ff 55%, #6600cc)', glow: '#9933ff', highlight: '#ddaaff' },
};

export function PuyoCell({ color, isPopping, isGhost, size = 40 }: PuyoCellProps) {
  if (!color) return <div style={{ width: size, height: size }} />;

  const c = COLORS[color];
  const eyeSize = Math.max(4, size * 0.14);
  const eyeGap = size * 0.1;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: isGhost ? 'transparent' : c.grad,
        border: isGhost ? `2px solid ${c.glow}88` : 'none',
        boxShadow: isGhost ? 'none' : `0 0 10px ${c.glow}66, 0 0 3px ${c.glow}44, inset 0 -3px 8px rgba(0,0,0,0.3)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        animation: isPopping ? 'puyoPop 0.5s ease-in-out forwards' : undefined,
        opacity: isGhost ? 0.35 : 1,
        flexShrink: 0,
      }}
    >
      {!isGhost && (
        <>
          {/* Shine highlight */}
          <div style={{
            position: 'absolute',
            top: '12%',
            left: '18%',
            width: '30%',
            height: '22%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            filter: 'blur(1px)',
          }} />

          {/* Eyes */}
          <div style={{
            position: 'absolute',
            top: '34%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            gap: eyeGap,
          }}>
            <div style={{ width: eyeSize, height: eyeSize * 1.3, borderRadius: '50%', background: '#111133' }} />
            <div style={{ width: eyeSize, height: eyeSize * 1.3, borderRadius: '50%', background: '#111133' }} />
          </div>

          {/* Eye shine */}
          <div style={{
            position: 'absolute',
            top: '29%',
            left: 'calc(50% - ' + (eyeSize * 0.5 + eyeGap * 0.5 + eyeSize * 0.3) + 'px)',
            width: eyeSize * 0.4,
            height: eyeSize * 0.4,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.7)',
          }} />
        </>
      )}
    </div>
  );
}
