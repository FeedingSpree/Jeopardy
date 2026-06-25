import { GameState } from '../types';
import { ArrowLeft, Check, X } from 'lucide-react';
import { closeQuestion, resolveBuzz } from '../lib/game';

interface Props {
  gameState: GameState;
  onLeaveHost: () => void;
}

export function HostQuestionControls({ gameState, onLeaveHost }: Props) {
  // Find current question details
  let currentCat = null;
  let currentQ = null;

  for (const cat of gameState.categories) {
    const q = cat.questions.find(q => q.id === gameState.currentQuestionId);
    if (q) {
      currentCat = cat;
      currentQ = q;
      break;
    }
  }

  if (!currentQ || !currentCat) {
    return <div className="p-8 text-white">Question not found.</div>;
  }

  const handleClose = () => {
    if (currentCat && currentQ) {
       closeQuestion(gameState.categories, currentQ.id);
    }
  };

  const handleResolve = (correct: boolean) => {
    if (gameState.buzzedPlayerId && currentQ) {
       resolveBuzz(correct, gameState.categories, currentQ.id, gameState.buzzedPlayerId, currentQ.points);
    }
  };

  const buzzedPlayer = gameState.buzzedPlayerId ? gameState.players[gameState.buzzedPlayerId] : null;

  return (
    <div className="min-h-screen bg-[#060B28] font-sans p-6 text-white flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-8 bg-[#0B1953] p-4 rounded-xl border border-[#1E3A8A]">
          <button 
            onClick={handleClose}
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors px-4 py-2 bg-[#060B28] rounded-lg border border-[#1E3A8A] font-bold uppercase text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Close Question & Retract
          </button>
          <div className="text-xl font-black tracking-widest uppercase text-[#FFD700]">
            {currentCat.name} • ${currentQ.points}
          </div>
        </div>

        <div className="w-full bg-[#0B1953] border-4 border-[#1E3A8A] rounded-xl p-12 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0 mt-8 min-h-[300px]">
          {currentQ.videoUrl ? (
            <div className="w-full aspect-video rounded overflow-hidden max-w-2xl bg-black/50 mx-auto border border-[#1E3A8A]">
              {(() => {
                const url = currentQ.videoUrl;
                const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
                const ytId = ytMatch ? ytMatch[1] : null;
                if (ytId) {
                  return (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  );
                }
                return (
                  <video 
                    src={url} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                );
              })()}
            </div>
          ) : (
            <h2 className="text-4xl md:text-5xl font-black font-sans text-white uppercase tracking-wide leading-tight px-4 max-w-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {currentQ.text || 'NO TEXT'}
            </h2>
          )}
          
          {currentQ.answer && (
            <div className="absolute top-4 left-4 right-4 bg-[#060B28] border-2 border-[#1E3A8A] rounded px-4 py-3 text-sm text-[#FFD700] font-bold uppercase tracking-wider">
              <span className="opacity-70 mr-2 text-white">Answer:</span>
              {currentQ.answer}
            </div>
          )}
        </div>

        <div className="w-full mt-12 flex-1 flex flex-col items-center justify-start">
          {gameState.status === 'question' && (
            <div className="text-center space-y-4 animate-pulse pt-12">
              <div className="w-16 h-16 rounded-full bg-[#0B1953] border-[4px] border-[#1E3A8A] border-t-[#FFD700] animate-spin mx-auto"></div>
              <p className="text-xl font-bold uppercase text-blue-300">Waiting for players to buzz...</p>
            </div>
          )}

          {gameState.status === 'buzzed' && buzzedPlayer && (
            <div className="w-full max-w-lg bg-[#0B1953] border-2 border-[#22C55E] rounded-xl p-8 shadow-[0_0_20px_rgba(34,197,94,0.4)] flex flex-col items-center text-center transform scale-105 transition-all">
              <div className="text-sm font-black uppercase tracking-widest text-[#22C55E] mb-2">Buzzed In!</div>
              <div className="text-4xl font-black font-sans text-white mb-8">{buzzedPlayer.name}</div>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => handleResolve(true)}
                  className="flex-1 py-4 bg-[#22C55E] hover:bg-green-600 text-[#060B28] rounded-xl font-black uppercase tracking-wider text-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Check className="w-6 h-6" /> Correct
                </button>
                <button 
                  onClick={() => handleResolve(false)}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-wider text-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <X className="w-6 h-6" /> Incorrect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
