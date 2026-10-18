import React, { useState } from 'react';
import { Game } from '../types';
import { X, Maximize2, Minimize2, RotateCcw, ExternalLink, ShieldAlert, Globe } from 'lucide-react';

interface InGameBrowserModalProps {
  game: Game | null;
  onClose: () => void;
}

export const InGameBrowserModal: React.FC<InGameBrowserModalProps> = ({ game, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!game) return null;

  const reloadGame = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fadeIn">
      {/* Top Header Control Bar */}
      <div className="bg-[#0f1422] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-white">{game.title}</span>
          </div>
          <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
            โหมดเล่นบนเว็บ GameVault โดยตรง
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={reloadGame}
            title="รีโหลดหน้าเกม"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'ย่อหน้าต่าง' : 'เต็มหน้าจอ'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <a
            href={game.game_url}
            target="_blank"
            rel="noopener noreferrer"
            title="เปิดในแท็บแยกกรณีเกมบล็อกการแสดงผลในหน้าต่าง"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs px-2.5"
          >
            <span>แท็บใหม่</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            title="ปิดหน้าต่างเกม"
            className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="bg-blue-950/40 border-b border-blue-500/20 px-4 py-1.5 text-[11px] text-blue-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          เล่นเกมออนไลน์ได้ทันทีในเว็บ GameVault หากบางเซิร์ฟเวอร์มีระบบป้องกัน iFrame สามารถกดปุ่ม "แท็บใหม่" ได้ตลอดเวลา
        </span>
        <span className="hidden sm:inline text-slate-400">
          ผู้พัฒนา: {game.developer}
        </span>
      </div>

      {/* Embedded Iframe */}
      <div className="flex-1 w-full bg-[#080b12] relative overflow-hidden">
        <iframe
          key={iframeKey}
          src={game.game_url}
          title={game.title}
          allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};
