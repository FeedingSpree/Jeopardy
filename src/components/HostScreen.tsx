import { GameState } from '../types';
import { HostSetup } from './HostSetup';
import { HostBoard } from './HostBoard';
import { HostQuestionControls } from './HostQuestionControls';

interface HostScreenProps {
  gameState: GameState;
  onLeaveHost: () => void;
}

export function HostScreen({ gameState, onLeaveHost }: HostScreenProps) {
  if (gameState.status === 'setup') {
    return <HostSetup gameState={gameState} onLeaveHost={onLeaveHost} />;
  }

  if (gameState.status === 'board') {
    return <HostBoard gameState={gameState} onLeaveHost={onLeaveHost} />;
  }

  if (gameState.status === 'question' || gameState.status === 'buzzed') {
    return <HostQuestionControls gameState={gameState} onLeaveHost={onLeaveHost} />;
  }

  return null;
}
