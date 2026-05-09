import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { NextPiece } from './components/NextPiece';
import { ScorePanel } from './components/ScorePanel';

export function App() {
  const { state, restart } = useGame();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060614 0%, #0c0828 40%, #180830 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Noto Sans JP', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(80, 40, 255, 0.08)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255, 50, 150, 0.07)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'rgba(40, 80, 255, 0.05)', filter: 'blur(80px)' }} />
      </div>

      {/* Title */}
      <h1 style={{
        color: '#eeeeff',
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: 8,
        marginBottom: 20,
        textShadow: '0 0 30px rgba(150,150,255,0.6), 0 0 60px rgba(100,100,255,0.3)',
        fontFamily: 'Noto Sans JP, sans-serif',
        position: 'relative',
      }}>
        ぷよぷよ
      </h1>

      {/* Game layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
        {/* Score panel */}
        <ScorePanel
          score={state.score}
          level={state.level}
          totalPopped={state.totalPopped}
          chainCount={state.chainCount}
          maxChain={state.maxChain}
        />

        {/* Board */}
        <div style={{ position: 'relative' }}>
          <Board state={state} />

          {/* Game over overlay */}
          {state.phase === 'gameover' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(4, 4, 20, 0.88)',
              borderRadius: 14,
              backdropFilter: 'blur(6px)',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              <div style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#ff4455',
                textShadow: '0 0 20px #ff2233, 0 0 40px #ff000088',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: 3,
                marginBottom: 8,
              }}>
                ゲームオーバー
              </div>
              <div style={{ color: '#7777aa', fontSize: 13, marginBottom: 4 }}>
                最終スコア
              </div>
              <div style={{
                color: '#dddeff',
                fontSize: 28,
                fontWeight: 700,
                fontFamily: 'Orbitron, monospace',
                textShadow: '0 0 15px rgba(150,150,255,0.5)',
                marginBottom: 6,
              }}>
                {state.score.toLocaleString()}
              </div>
              <div style={{ color: '#7777aa', fontSize: 12, marginBottom: 24 }}>
                最大連鎖: {state.maxChain}連鎖
              </div>
              <button
                onClick={restart}
                style={{
                  padding: '11px 30px',
                  background: 'linear-gradient(135deg, #5544ff, #aa33ff)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(120,80,255,0.5), 0 4px 15px rgba(0,0,0,0.4)',
                  fontFamily: 'Noto Sans JP, sans-serif',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(120,80,255,0.7), 0 4px 20px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(120,80,255,0.5), 0 4px 15px rgba(0,0,0,0.4)';
                }}
              >
                もう一度
              </button>
            </div>
          )}
        </div>

        {/* Next pieces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
          <NextPiece piece={state.nextPieces[0]} label="NEXT" size={36} />
          <NextPiece piece={state.nextPieces[1]} label="2ND" size={28} />
        </div>
      </div>

      {/* Controls hint */}
      <div style={{
        marginTop: 18,
        color: '#33335566',
        fontSize: 11,
        letterSpacing: 1,
        textAlign: 'center',
      }}>
        ← → 移動　　Z / X 回転　　↓ ソフトドロップ　　Space ハードドロップ
      </div>
    </div>
  );
}
