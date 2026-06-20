import { GameState } from '../types';
import { HostSetup } from './HostSetup';
import { HostBoard } from './HostBoard';
import { HostQuestionControls } from './HostQuestionControls';

interface HostScreenProps {
  gameState: GameState;
}

export function HostScreen({ gameState }: HostScreenProps) {
  if (gameState.status === 'setup') {
    return <HostSetup gameState={gameState} />;
  }

  if (gameState.status === 'board') {
    return <HostBoard gameState={gameState} />;
  }

  if (gameState.status === 'question' || gameState.status === 'buzzed') {
    return <HostQuestionControls gameState={gameState} />;
  }

  return null;
}
