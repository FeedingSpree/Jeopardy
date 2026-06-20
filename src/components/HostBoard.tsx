import { GameState, Category } from '../types';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { openQuestion, resetGame } from '../lib/game';

interface Props {
  gameState: GameState;
}

export function HostBoard({ gameState }: Props) {
  const handleOpenQuestion = (questionId: string) => {
    openQuestion(questionId);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to completely reset the game? This returns to setup.')) {
      resetGame();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060B28] text-white font-sans p-6 overflow-hidden">
      <header className="flex justify-between items-center bg-[#0B1953] p-4 rounded-xl border-2 border-[#1E3A8A] mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#FFD700] tracking-tighter">PRO JEOPARDY <span className="text-white font-normal opacity-50">|</span> HOST CONSOLE</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleReset}
            className="px-4 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md text-sm font-bold uppercase"
          >
            Reset Game
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* The Board */}
        <div className="flex-[3] grid" style={{ gridTemplateColumns: `repeat(${Math.max(1, gameState.categories.length)}, minmax(0, 1fr))`, gap: '10px' }}>
          {gameState.categories.map(cat => (
            <div key={cat.id} className="flex flex-col gap-3">
              <div className="bg-[#0033A0] text-[#FFD700] font-black uppercase text-xs text-center p-2 border-b-2 border-[#1E3A8A] w-full rounded-t-md h-12 flex items-center justify-center">
                <span className="line-clamp-2">{cat.name}</span>
              </div>
              
              {cat.questions.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleOpenQuestion(q.id)}
                  disabled={q.answered}
                  className={`flex-1 min-h-[60px] border-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                    q.answered 
                      ? 'bg-[#0B1953] border-[#1E3A8A] opacity-40 cursor-not-allowed' 
                      : 'bg-[#0B1953] border-[#1E3A8A] hover:border-blue-400'
                  }`}
                >
                  <span className="text-[#FFD700] text-3xl font-extrabold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                    {!q.answered && `$${q.points}`}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Players Sidebar */}
        <aside className="flex-1 flex flex-col gap-4">
          <div className="bg-[#0B1953] border-2 border-[#1E3A8A] rounded-xl p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-black text-blue-300 uppercase mb-4">Players Session ({Object.values(gameState.players).length})</h3>
            
            <div className="flex flex-col gap-3">
              {Object.values(gameState.players).length === 0 ? (
                <div className="text-blue-300/50 text-sm italic">Waiting for players...</div>
              ) : (
                Object.values(gameState.players)
                  .sort((a, b) => b.score - a.score)
                  .map((player) => (
                    <div key={player.id} className="bg-[#1E3A8A]/30 rounded-xl flex items-center p-3 gap-4 border-2 border-white/10">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-lg">{player.name}</div>
                        <div className="text-[#FFD700] font-mono text-sm leading-none">${player.score}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
