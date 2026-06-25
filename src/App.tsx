import { useEffect, useState } from 'react';
import { GameState } from './types';
import { HostScreen } from './components/HostScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { motion } from 'motion/react';
import { subscribeToGame, initializeGameDoc, joinAsPlayer, claimHost, releaseHost } from './lib/game';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [role, setRole] = useState<'host' | 'player' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [myId, setMyId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('jeopardy_player_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('jeopardy_player_id', id);
    }
    setMyId(id);

    initializeGameDoc().then(() => {
      subscribeToGame((state) => {
        setGameState(state);
      });
    });
  }, []);

  if (!gameState) {
    return <div className="min-h-screen flex items-center justify-center bg-[#060B28] text-white font-sans">Connecting to server...</div>;
  }

  const handleJoinAsHost = async () => {
    await claimHost(myId);
    setRole('host');
  };

  const handleLeaveHost = async () => {
    await releaseHost();
    setRole(null);
  };

  const handleJoinAsPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      await joinAsPlayer(myId, playerName.trim());
      setRole('player');
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060B28] text-white font-sans p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-[#0B1953] border-2 border-[#1E3A8A] rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-black tracking-tighter text-center mb-8 text-[#FFD700]">PRO JEOPARDY</h1>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 uppercase text-[#FFD700] text-sm">Host Game</h2>
              <button 
                onClick={handleJoinAsHost}
                disabled={!!gameState.hostSocketId && gameState.hostSocketId !== myId}
                className="w-full py-3 px-4 bg-[#0033A0] hover:bg-[#1E3A8A] border-2 border-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold uppercase transition-colors"
              >
                {gameState.hostSocketId ? 'Host Already Present' : 'Start as Host'}
              </button>
            </div>

            <div className="pt-8 border-t-2 border-[#1E3A8A]">
              <h2 className="text-xl font-bold mb-4 uppercase text-[#FFD700] text-sm">Join as Player</h2>
              <form onSubmit={handleJoinAsPlayer} className="space-y-4">
                <input 
                  type="text" 
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Enter your name" 
                  className="w-full px-4 py-3 bg-[#060B28] border-2 border-[#1E3A8A] rounded-lg focus:outline-none focus:border-[#FFD700] transition-colors"
                  required
                />
                <button 
                  type="submit"
                  className="w-full py-3 px-4 bg-[#22C55E] hover:bg-green-600 rounded-lg font-bold uppercase text-[#060B28] transition-colors"
                >
                  Join Game
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (role === 'host') {
    return <HostScreen gameState={gameState} onLeaveHost={handleLeaveHost} />;
  }

  return <PlayerScreen gameState={gameState} playerId={myId} />;
}
