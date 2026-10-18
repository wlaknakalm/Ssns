import React, { useState } from 'react';
import { Gamepad2, Sparkles, Star, RefreshCw, Download, Shield } from 'lucide-react';

interface NavbarProps {
  apiStatus: {
    connected: boolean;
    latency: number;
    source: string;
    loading: boolean;
  };
  onRefresh: () => void;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  onOpenRandom: () => void;
  downloadsCount: number;
  onOpenDownloads: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiStatus,
  onRefresh,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  onOpenRandom,
  downloadsCount,
  onOpenDownloads,
  isAdminLoggedIn,
  onOpenAdmin,
}) => {
  const [badgeClicks, setBadgeClicks] = useState(0);

  const handleBadgeClick = () => {
    const next = badgeClicks + 1;
    if (next >= 3) {
      setBadgeClicks(0);
      onOpenAdmin();
    } else {
      setBadgeClicks(next);
      setTimeout(() => setBadgeClicks(0), 1200);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f1420]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                Game<span className="text-blue-500">Vault</span>
              </span>
              <button
                onClick={handleBadgeClick}
                title="คลิก 3 ครั้งเพื่อเปิดระบบหลังบ้าน"
                className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:border-amber-500/40 hover:text-amber-300 transition-colors cursor-pointer"
              >
                PRO v3.7
              </button>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              ดาวน์โหลดตรงในเว็บ • เล่นได้ทันทีไม่ต้องเข้าเว็บอื่น
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 bg-[#172033] px-3.5 py-1.5 rounded-full border border-blue-500/30 text-xs text-slate-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${apiStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="font-medium text-slate-200">
            {apiStatus.loading
              ? 'กำลังดึงข้อมูลสด...'
              : apiStatus.connected
              ? `Live API Connected (${apiStatus.latency}ms)`
              : 'โหมดออฟไลน์แคช'}
          </span>
          <button
            onClick={onRefresh}
            title="รีเฟรชข้อมูลเซิร์ฟเวอร์"
            className="ml-1 p-1 hover:text-blue-400 transition-colors text-slate-400 hover:rotate-180 transform duration-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${apiStatus.loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

        {/* Actions (Downloads, Random game, Favorites & Admin Portal button if logged in) */}
        <div className="flex items-center gap-2">
          {/* Admin Portal Quick Access Button if Authenticated */}
          {isAdminLoggedIn && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-sm"
              title="เปิดแผงควบคุมหลังบ้านแอดมิน"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>หลังบ้านแอดมิน</span>
            </button>
          )}

          {/* Download Manager Button */}
          <button
            onClick={onOpenDownloads}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#172033] border border-blue-500/30 text-blue-300 hover:bg-blue-600/20 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">การดาวน์โหลด</span>
            {downloadsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-bold">
                {downloadsCount}
              </span>
            )}
          </button>

          {/* Random Game */}
          <button
            onClick={onOpenRandom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">สุ่มเกมวันนี้</span>
          </button>

          {/* Favorites */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showFavoritesOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-[#172033] border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span>รายการโปรด</span>
            {favoritesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
