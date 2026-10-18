import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { Sparkles, X, ExternalLink, Dices, Info } from 'lucide-react';

interface RandomGameModalProps {
  games: Game[];
  isOpen: boolean;
  onClose: () => void;
  onOpenDetail: (game: Game) => void;
}

export const RandomGameModal: React.FC<RandomGameModalProps> = ({
  games,
  isOpen,
  onClose,
  onOpenDetail,
}) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollGame = () => {
    if (!games.length) return;
    setIsRolling(true);

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * games.length);
      setSelectedGame(games[randomIndex]);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);
  };

  useEffect(() => {
    if (isOpen && games.length > 0) {
      rollGame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-[#101623] border border-blue-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/30">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          🎲 ไม่รู้จะเล่นเกมไหนดี?
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          ระบบสุ่มเลือกเกมฟรีคุณภาพสูงให้คุณลองเล่นวันนี้!
        </p>

        {selectedGame && (
          <div className="w-full bg-[#151c2d] border border-slate-800 rounded-xl overflow-hidden mb-6 p-4 flex flex-col items-center">
            <div className="relative w-full h-44 rounded-lg overflow-hidden bg-slate-900 mb-3 border border-slate-800">
              <img
                src={selectedGame.thumbnail}
                alt={selectedGame.title}
                className={`w-full h-full object-cover transition-all duration-200 ${
                  isRolling ? 'filter blur-sm scale-105' : 'scale-100'
                }`}
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] rounded bg-blue-600/90 text-white font-medium">
                {selectedGame.genre}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-1">
              {selectedGame.title}
            </h4>
            <p className="text-xs text-slate-400 mb-3 line-clamp-2">
              {selectedGame.short_description}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{selectedGame.platform}</span>
              <span>•</span>
              <span>ผู้พัฒนา: {selectedGame.developer}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={rollGame}
            disabled={isRolling}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            <span>สุ่มอีกครั้ง</span>
          </button>

          {selectedGame && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenDetail(selectedGame);
                }}
                className="py-2.5 px-4 bg-[#1a2337] hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
              >
                <Info className="w-4 h-4 text-blue-400" />
                <span>ดูรายละเอียด</span>
              </button>

              <a
                href={selectedGame.game_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
              >
                <span>เล่นเกมนี้เลย</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
