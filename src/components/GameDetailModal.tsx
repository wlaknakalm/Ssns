import React, { useEffect, useState } from 'react';
import { Game, GameDetail } from '../types';
import { getGameDetail } from '../services/gameApi';
import {
  downloadWindowsLauncher,
  downloadDesktopShortcut,
  downloadGameConfig,
} from '../services/downloadService';
import {
  X,
  ExternalLink,
  Cpu,
  HardDrive,
  Layers,
  Calendar,
  Building2,
  Monitor,
  CheckCircle,
  Maximize2,
  Star,
  Copy,
  Check,
  Loader2,
  Download,
  Play,
  FileCode,
  FileText
} from 'lucide-react';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onPlayInBrowser: (game: Game) => void;
  onNotify: (msg: string) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
  onPlayInBrowser,
  onNotify,
}) => {
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!game) return;

    let isMounted = true;
    setLoading(true);

    getGameDetail(game.id).then((data) => {
      if (isMounted) {
        if (data) {
          setDetail(data);
        } else {
          setDetail({
            ...game,
            status: 'Live',
            description: game.short_description,
          });
        }
        setLoading(false);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [game, onClose]);

  if (!game) return null;

  const data = detail || {
    ...game,
    status: 'Live',
    description: game.short_description,
  };

  const screenshots = data.screenshots && data.screenshots.length > 0 ? data.screenshots : [];
  const reqs = data.minimum_system_requirements;
  const isBrowser = game.platform.toLowerCase().includes('browser') || game.platform.toLowerCase().includes('web');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(game.game_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLauncher = () => {
    downloadWindowsLauncher(game);
    onNotify(`📥 ดาวน์โหลดตัวติดตั้ง ${game.title} สำเร็จแล้ว!`);
  };

  const handleDownloadShortcut = () => {
    downloadDesktopShortcut(game);
    onNotify(`📥 ดาวน์โหลดทางลัด Desktop สำหรับ ${game.title} สำเร็จ!`);
  };

  const handleDownloadManifest = () => {
    downloadGameConfig(game);
    onNotify(`📥 บันทึกข้อมูล Config ของ ${game.title} สำเร็จ!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Modal Card */}
      <div
        className="relative bg-[#101623] border border-blue-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/80 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#131b2c]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {data.genre}
            </span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {data.status || 'Live'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(game.id)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="คัดลอกลิงก์เกม"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Hero Banner Area */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video max-h-72 w-full">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101623] via-[#101623]/40 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 shadow-sm">
                {game.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-3">
                <span>{game.platform}</span>
                <span>•</span>
                <span>ผู้พัฒนา: {game.developer}</span>
                <span>•</span>
                <span>วางจำหน่าย: {game.release_date}</span>
              </p>
            </div>
          </div>

          {/* Direct In-Site Download & Launch Center */}
          <div className="bg-[#141d30] border border-blue-500/40 rounded-xl p-4 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>ดาวน์โหลดและเปิดเล่นบนเว็บเราได้ทันที (Direct In-Site Access)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              คุณสามารถดาวน์โหลดตัวติดตั้งเกมลงเครื่องได้โดยตรงทันที หรือกดเล่นบนหน้าเว็บนี้ได้โดยไม่ต้องเปลี่ยนหน้า:
            </p>

            <div className="flex flex-wrap gap-2.5">
              {isBrowser && (
                <button
                  onClick={() => {
                    onClose();
                    onPlayInBrowser(game);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>🎮 เล่นในเว็บนี้ทันที (Play In-Browser)</span>
                </button>
              )}

              <button
                onClick={handleDownloadLauncher}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>📥 ดาวน์โหลดตัวติดตั้ง Windows (.bat)</span>
              </button>

              <button
                onClick={handleDownloadShortcut}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>โหลดทางลัด Desktop (.url)</span>
              </button>

              <button
                onClick={handleDownloadManifest}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>บันทึก Config (.json)</span>
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#172033] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Monitor className="w-3.5 h-3.5 text-blue-400" /> แพลตฟอร์ม
              </span>
              <p className="text-xs font-semibold text-white">{game.platform}</p>
            </div>

            <div className="bg-[#172033] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" /> ผู้จัดจำหน่าย
              </span>
              <p className="text-xs font-semibold text-white truncate">{game.publisher}</p>
            </div>

            <div className="bg-[#172033] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> วันที่เปิดตัว
              </span>
              <p className="text-xs font-semibold text-white">{game.release_date || 'N/A'}</p>
            </div>

            <div className="bg-[#172033] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> หมวดหมู่
              </span>
              <p className="text-xs font-semibold text-white">{game.genre}</p>
            </div>
          </div>

          {/* About / Description */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              เกี่ยวกับเกมนี้
            </h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#141b2a] p-4 rounded-xl border border-slate-800 whitespace-pre-line">
              {loading ? (
                <div className="flex items-center gap-2 py-4 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังโหลดข้อมูลเรื่องย่อและรายละเอียดแบบเต็ม...</span>
                </div>
              ) : (
                data.description || game.short_description
              )}
            </div>
          </div>

          {/* Screenshots Gallery */}
          {screenshots.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                ภาพหน้าจอในเกม (Screenshots)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {screenshots.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className="relative group rounded-lg overflow-hidden border border-slate-800 aspect-video cursor-pointer bg-slate-900"
                  >
                    <img
                      src={s.image}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Requirements (PC games) */}
          {reqs && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                สเปกคอมพิวเตอร์ขั้นต่ำ (Minimum System Requirements)
              </h3>
              <div className="bg-[#141b2a] border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0f1523] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-0.5">ระบบปฏิบัติการ (OS):</span>
                  <span className="font-medium text-slate-200">{reqs.os || 'Windows 7/8/10/11 64-bit'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f1523] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-0.5">หน่วยประมวลผล (CPU):</span>
                  <span className="font-medium text-slate-200">{reqs.processor || 'Intel Core i3 / AMD equivalent'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f1523] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-0.5">หน่วยความจำ (RAM):</span>
                  <span className="font-medium text-slate-200">{reqs.memory || '4 GB RAM หรือสูงกว่า'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f1523] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-0.5">การ์ดจอ (Graphics):</span>
                  <span className="font-medium text-slate-200">{reqs.graphics || 'NVIDIA GeForce / AMD Radeon'}</span>
                </div>
                {reqs.storage && (
                  <div className="p-2.5 rounded-lg bg-[#0f1523] border border-slate-800/80 sm:col-span-2 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-slate-400 text-[11px] mr-2">พื้นที่ว่างฮาร์ดดิสก์:</span>
                      <span className="font-medium text-slate-200">{reqs.storage}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#131b2c] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {copied ? '✅ คัดลอกลิงก์สำเร็จแล้ว!' : '🎮 ดาวน์โหลดตรงจากระบบ GameVault ทันที'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleDownloadLauncher}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดในเว็บเรา</span>
            </button>
            <a
              href={game.game_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              title="เปิดเว็บภายนอก (อุปกรณ์สำรอง)"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox for screenshots */}
      {activeImageIndex !== null && screenshots[activeImageIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setActiveImageIndex(null)}
        >
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={screenshots[activeImageIndex].image}
            alt="Fullscreen Screenshot"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};
