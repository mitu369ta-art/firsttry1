import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from '../game/types';
import {
  createInitialState,
  handleHardDrop,
  handleMoveLeft,
  handleMoveRight,
  handleRotateCCW,
  handleRotateCW,
  handleSoftDrop,
  tick,
} from '../game/logic';

const TICK_MS = 100;

export function useGame() {
  const [renderState, setRenderState] = useState<GameState>(createInitialState);
  const stateRef = useRef<GameState>(renderState);

  const apply = useCallback((fn: (s: GameState) => GameState) => {
    stateRef.current = fn(stateRef.current);
    setRenderState({ ...stateRef.current });
  }, []);

  // Game loop
  useEffect(() => {
    const id = setInterval(() => {
      if (stateRef.current.phase !== 'gameover') apply(tick);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [apply]);

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', ' ', 'z', 'Z', 'x', 'X'];
      if (keys.includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft':  apply(handleMoveLeft);   break;
        case 'ArrowRight': apply(handleMoveRight);  break;
        case 'ArrowDown':  apply(handleSoftDrop);   break;
        case ' ':          apply(handleHardDrop);   break;
        case 'z': case 'Z': apply(handleRotateCCW); break;
        case 'x': case 'X': apply(handleRotateCW);  break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [apply]);

  const restart = useCallback(() => {
    stateRef.current = createInitialState();
    setRenderState({ ...stateRef.current });
  }, []);

  return { state: renderState, restart };
}
