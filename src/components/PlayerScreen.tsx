import { GameState } from '../types';
import { Target, Bell } from 'lucide-react';
import { buzz } from '../lib/game';

interface Props {
  gameState: GameState;
  playerId: string;
}

export function PlayerScreen({ gameState, playerId }: Props) {
  const me = gameState.players[playerId];

  if (!me) {
    return <div className="min-h-screen bg-[#060B28] flex items-center justify-center font-sans text-white">Connecting player session...</div>;
  }

  const handleBuzz = () => {
    buzz(playerId);
  };

  if (gameState.status === 'setup') {
    return (
      <div className="min-h-screen bg-[#060B28] text-white font-sans flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#0B1953] border-4 border-[#1E3A8A] border-t-[#FFD700] animate-spin"></div>
        <div>
          <h2 className="text-3xl font-black text-[#FFD700] mb-2 tracking-tighter uppercase">Welcome, {me.name}</h2>
          <p className="text-blue-300 text-lg uppercase font-bold text-sm">Waiting for host to setup board...</p>
        </div>
      </div>
    );
  }

  if (gameState.status === 'board') {
    return (
      <div className="min-h-screen bg-[#060B28] font-sans text-white flex flex-col p-4 md:p-6 pb-24 overflow-hidden">
      <header className="flex justify-between items-center bg-[#0B1953] p-4 rounded-xl border-2 border-[#1E3A8A] mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#FFD700] tracking-tighter">PRO JEOPARDY <span className="text-white font-normal opacity-50">|</span> {me.name.toUpperCase()}</h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-emerald-400 font-black font-mono text-xl md:text-2xl">${me.score}</div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${Math.max(1, gameState.categories.length)}, minmax(0, 1fr))`, gap: '10px' }}>
          {gameState.categories.map(cat => (
            <div key={cat.id} className="flex flex-col gap-3 h-full">
              <div className="bg-[#0033A0] text-[#FFD700] font-black uppercase text-[10px] md:text-xs text-center p-2 border-b-2 border-[#1E3A8A] w-full rounded-t-md h-12 flex items-center justify-center">
                <span className="line-clamp-2">{cat.name}</span>
              </div>
              {cat.questions.map(q => (
                <div 
                  key={q.id}
                  className={`flex-1 min-h-[40px] border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                    q.answered ? 'bg-[#0B1953] border-[#1E3A8A] opacity-40' : 'bg-[#0B1953] border-[#1E3A8A]'
                  }`}
                >
                  <span className="text-[#FFD700] text-xl md:text-3xl font-extrabold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                    {!q.answered && `$${q.points}`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  }

  // Question or Buzzed State
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

  const amIBuzzed = gameState.buzzedPlayerId === playerId;
  const someoneElseBuzzed = gameState.buzzedPlayerId && !amIBuzzed;
  const activeBuzzerPlayer = gameState.buzzedPlayerId ? gameState.players[gameState.buzzedPlayerId]?.name : null;

  return (
    <div className="min-h-screen bg-[#060B28] font-sans text-white p-4 flex flex-col relative overflow-hidden">
      
      {/* Background pulsing glow when active */}
      {gameState.status === 'question' && (
        <div className="absolute inset-0 bg-[#FFD700]/5 animate-pulse rounded-full blur-[150px] -z-10 pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="w-full flex justify-between items-center bg-[#0B1953] rounded-2xl p-4 md:p-6 border-2 border-[#1E3A8A] mx-auto max-w-4xl shadow-xl">
        <div className="flex-1 opacity-70 font-bold uppercase text-[10px] text-blue-300">Playing for</div>
        <div className="font-black text-2xl md:text-3xl font-sans text-[#FFD700] tracking-wider">
          ${currentQ?.points}
        </div>
        <div className="flex-1 text-right text-emerald-400 font-mono font-bold text-xl md:text-2xl">
          ${me.score}
        </div>
      </div>
      
      {/* Large visual cue for the question itself */}
      <div className="flex-1 flex flex-col items-center p-4 max-w-4xl mx-auto w-full">
        {currentQ && (
          <div className="w-full shadow-2xl rounded-2xl bg-[#0B1953] border-4 border-[#1E3A8A] min-h-[250px] md:min-h-[300px] flex items-center justify-center text-center p-6 md:p-12 my-6 transform hover:scale-[1.01] transition-transform">
            {currentQ.videoUrl ? (
               <div className="w-full h-full my-4 rounded shadow-2xl overflow-hidden bg-black max-w-2xl aspect-video mx-auto border border-[#1E3A8A]">
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
               <h2 className="text-3xl md:text-5xl font-black text-white font-sans tracking-wide uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-tight md:leading-snug">
                 {currentQ.text || 'WATCH SCREEN'}
               </h2>
            )}
          </div>
        )}
      </div>

      {/* Buzzer Area */}
      <div className="flex-1 flex items-end justify-center pb-8 p-4">
        {gameState.status === 'question' && (
          <button 
            onClick={handleBuzz}
            className="group relative w-full max-w-sm md:max-w-md aspect-square rounded-full flex items-center justify-center bg-red-600 outline-none select-none touch-none shadow-[0_20px_50px_rgba(220,38,38,0.5)] border-[12px] border-red-800 active:scale-95 active:shadow-[0_10px_20px_rgba(220,38,38,0.6)] active:border-[6px] transition-all duration-75 overflow-hidden"
          >
            <div className="absolute inset-0 rounded-full border-[8px] border-white/20 m-4 group-active:m-2 transition-all"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <Bell className="w-24 h-24 text-red-100 drop-shadow-xl group-active:scale-90 transition-transform" />
          </button>
        )}

        {amIBuzzed && (
          <div className="w-full max-w-md bg-[#22C55E] rounded-3xl p-10 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(34,197,94,0.4)] animate-bounce border-none">
            <h3 className="text-5xl font-black uppercase tracking-widest text-[#060B28] mb-2">YOU BUZZED!</h3>
            <p className="text-[#060B28]/70 font-bold text-lg uppercase">Awaiting host ruling...</p>
          </div>
        )}

        {someoneElseBuzzed && (
          <div className="w-full max-w-md bg-[#0B1953]/50 border-4 border-[#1E3A8A] rounded-3xl p-10 flex flex-col items-center justify-center opacity-80 backdrop-blur">
            <h3 className="text-4xl font-black text-blue-300 mb-4">{activeBuzzerPlayer} BUZZED</h3>
            <p className="text-blue-300/50 font-bold uppercase">Locked out.</p>
          </div>
        )}
      </div>
    </div>
  );
}
