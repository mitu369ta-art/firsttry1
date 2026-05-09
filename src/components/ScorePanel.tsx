interface ScorePanelProps {
  score: number;
  level: number;
  totalPopped: number;
  chainCount: number;
  maxChain: number;
}

export function ScorePanel({ score, level, totalPopped, chainCount, maxChain }: ScorePanelProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      padding: '20px 18px',
      background: 'rgba(8, 8, 28, 0.85)',
      borderRadius: 14,
      border: '1px solid rgba(100, 120, 255, 0.2)',
      boxShadow: 'inset 0 0 30px rgba(0, 0, 50, 0.4)',
      minWidth: 130,
    }}>
      <Stat label="スコア" value={score.toLocaleString()} big />
      <Stat label="レベル" value={level} />
      <Stat label="消去数" value={totalPopped} />
      <Stat
        label="最大連鎖"
        value={maxChain > 0 ? `${maxChain}連鎖` : '-'}
        glow={maxChain >= 3}
      />
      {chainCount > 0 && (
        <div style={{
          textAlign: 'center',
          color: '#ffcc00',
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'Orbitron, monospace',
          textShadow: '0 0 12px #ffcc00, 0 0 24px #ff8800',
          animation: 'chainPulse 0.4s ease-out',
        }}>
          {chainCount}連鎖!
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  big,
  glow,
}: {
  label: string;
  value: string | number;
  big?: boolean;
  glow?: boolean;
}) {
  return (
    <div>
      <div style={{
        color: '#555588',
        fontSize: 9,
        letterSpacing: 2,
        fontFamily: 'Orbitron, monospace',
        marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        color: glow ? '#ffcc00' : '#dddeff',
        fontSize: big ? 22 : 17,
        fontWeight: 700,
        fontFamily: 'Orbitron, monospace',
        textShadow: glow ? '0 0 10px #ffcc00' : undefined,
        letterSpacing: 1,
      }}>
        {value}
      </div>
    </div>
  );
}
