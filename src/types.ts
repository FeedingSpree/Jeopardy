export interface Question {
  id: string;
  points: number;
  text: string;
  answer?: string;
  videoUrl?: string; // e.g. youtube url
  isDailyDouble?: boolean;
  answered?: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Player {
  id: string;
  name: string;
  score: number;
  buzzedAt?: number;
}

// Game Statuses
// 'setup' - Host is configuring the board
// 'board' - Showing categories and point values, host chooses a question
// 'question' - Question is on screen, players can buzz
// 'buzzed' - A player has buzzed in, waiting for host to award/deduct points
export type GameStatus = 'setup' | 'board' | 'question' | 'buzzed';

export interface GameState {
  status: GameStatus;
  categories: Category[];
  players: Record<string, Player>;
  currentQuestionId: string | null; // question id
  buzzedPlayerId: string | null;
  hostSocketId: string | null;
}

export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  error: (msg: string) => void;
}

export interface ClientToServerEvents {
  joinAsHost: () => void;
  joinAsPlayer: (name: string) => void;
  updateBoard: (categories: Category[]) => void;
  startGame: () => void;
  openQuestion: (questionId: string) => void;
  closeQuestion: () => void;
  buzz: () => void;
  resolveBuzz: (correct: boolean) => void;
  updatePlayerScore: (playerId: string, delta: number) => void;
  resetGame: () => void;
}
