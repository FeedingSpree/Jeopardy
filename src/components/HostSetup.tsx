import { useState } from 'react';
import { GameState, Category, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { updateBoard, startGame } from '../lib/game';

interface Props {
  gameState: GameState;
  onLeaveHost: () => void;
}

export function HostSetup({ gameState, onLeaveHost }: Props) {
  const [categories, setCategories] = useState<Category[]>(gameState.categories.length ? gameState.categories : [
    {
      id: uuidv4(),
      name: 'Category 1',
      questions: [
        { id: uuidv4(), points: 200, text: '' },
        { id: uuidv4(), points: 400, text: '' },
      ]
    }
  ]);

  const addCategory = () => {
    setCategories([...categories, {
      id: uuidv4(),
      name: `Category ${categories.length + 1}`,
      questions: [
        { id: uuidv4(), points: 200, text: '' },
        { id: uuidv4(), points: 400, text: '' },
      ]
    }]);
  };

  const updateCategoryName = (catId: string, name: string) => {
    setCategories(categories.map(c => c.id === catId ? { ...c, name } : c));
  };

  const removeCategory = (catId: string) => {
    setCategories(categories.filter(c => c.id !== catId));
  };

  const addQuestion = (catId: string) => {
    setCategories(categories.map(c => {
      if (c.id === catId) {
        const nextPoints = c.questions.length > 0 ? c.questions[c.questions.length - 1].points + 200 : 200;
        return {
          ...c,
          questions: [...c.questions, { id: uuidv4(), points: nextPoints, text: '' }]
        };
      }
      return c;
    }));
  };

  const updateQuestion = (catId: string, qId: string, updates: Partial<Question>) => {
    setCategories(categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          questions: c.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
        };
      }
      return c;
    }));
  };

  const removeQuestion = (catId: string, qId: string) => {
    setCategories(categories.map(c => {
      if (c.id === catId) {
        return { ...c, questions: c.questions.filter(q => q.id !== qId) };
      }
      return c;
    }));
  };

  const handleStart = async () => {
    await updateBoard(categories);
    await startGame();
  };

  return (
    <div className="min-h-screen bg-[#060B28] text-white font-sans p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-[#0B1953] p-4 rounded-xl border-2 border-[#1E3A8A]">
          <div>
            <h1 className="text-2xl font-black text-[#FFD700] tracking-tighter">PRO JEOPARDY <span className="text-white font-normal opacity-50">|</span> HOST SETUP</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={onLeaveHost}
              className="px-4 py-1.5 bg-red-900/50 hover:bg-red-600 text-white rounded-md font-bold text-sm transition-colors"
            >
              LEAVE HOST
            </button>
            <button 
              onClick={handleStart}
              className="px-4 py-1.5 bg-[#FFD700] text-[#060B28] rounded-md font-bold text-sm"
            >
              START GAME
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat, catIdx) => (
            <motion.div 
              key={cat.id} 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0B1953] border-2 border-[#1E3A8A] rounded-xl p-5 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={cat.name}
                  onChange={e => updateCategoryName(cat.id, e.target.value)}
                  className="flex-1 bg-[#060B28] border border-[#1E3A8A] rounded block w-full px-3 py-2 text-xl font-bold focus:ring-2 focus:ring-[#FFD700] outline-none text-[#FFD700]"
                  placeholder="Category Name"
                />
                <button 
                  onClick={() => removeCategory(cat.id)}
                  className="p-2 text-red-400 hover:bg-[#1E3A8A]/50 rounded transition-colors"
                  title="Remove Category"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {cat.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-3 bg-[#060B28] rounded-lg border border-[#1E3A8A] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-300 font-mono text-xs font-bold">${q.points}</span>
                      <input 
                        type="number"
                        value={q.points || ''}
                        onChange={e => updateQuestion(cat.id, q.id, { points: parseInt(e.target.value) || 0 })}
                        className="w-20 bg-[#0B1953] text-sm px-2 py-1 rounded border border-[#1E3A8A] focus:ring-1 focus:ring-[#FFD700] outline-none text-[#FFD700]"
                        placeholder="Points"
                      />
                      <div className="flex-1"></div>
                      <button 
                        onClick={() => removeQuestion(cat.id, q.id)}
                        className="text-blue-300/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea 
                      value={q.text}
                      onChange={e => updateQuestion(cat.id, q.id, { text: e.target.value })}
                      placeholder="Question text..."
                      className="w-full bg-[#0B1953] text-sm px-3 py-2 rounded resize-none border border-[#1E3A8A] focus:ring-1 focus:ring-[#FFD700] outline-none"
                      rows={2}
                    />
                    
                    <input 
                      type="text"
                      value={q.answer || ''}
                      onChange={e => updateQuestion(cat.id, q.id, { answer: e.target.value })}
                      placeholder="Answer (optional)"
                      className="w-full bg-[#0B1953] text-sm px-3 py-2 border border-[#1E3A8A] rounded focus:ring-1 focus:ring-[#FFD700] outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-300" />
                      <input 
                        type="url"
                        value={q.videoUrl || ''}
                        onChange={e => updateQuestion(cat.id, q.id, { videoUrl: e.target.value })}
                        placeholder="YouTube URL (optional)"
                        className="w-full bg-[#0B1953] border border-[#1E3A8A] text-[10px] px-2 py-1.5 rounded focus:ring-1 focus:ring-[#FFD700] outline-none placeholder-blue-300/50"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => addQuestion(cat.id)}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-[#FFD700] hover:text-white hover:bg-[#1E3A8A] border-2 border-transparent hover:border-[#FFD700] rounded transition-colors uppercase"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </motion.div>
          ))}
          
          <button 
            onClick={addCategory}
            className="flex flex-col items-center justify-center gap-3 bg-[#0B1953] border-2 border-dashed border-[#1E3A8A] hover:border-[#FFD700] rounded-xl p-5 min-h-[300px] text-blue-300 hover:text-[#FFD700] transition-colors"
          >
            <Plus className="w-8 h-8" />
            <span className="font-bold uppercase tracking-wider text-sm">Add Category</span>
          </button>
        </div>
      </div>
    </div>
  );
}
