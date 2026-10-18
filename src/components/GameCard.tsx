import React, { useState } from 'react';
import { Game } from '../types';
import { Download, Info, Star, Monitor, Globe, Calendar, Building2, Play, CheckCircle2, Loader2 } from 'lucide-react';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onOpenDetail: (game: Game) => void;
  onDirectDownload: (game: Game) => void;
  onPlayInBrowser: (game: Game) => void;
  viewMode: 'grid' | 'list';
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
  onDirectDownload,
  onPlayInBrowser,
  viewMode,
}) => {
  const [imgSrc, setImgSrc] = useState(game.thumbnail);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isPc = game.platform.toLowerCase().includes('windows') || game.platform.toLowerCase().includes('pc');
  const isBrowser = game.platform.toLowerCase().includes('browser') || game.platform.toLowerCase().includes('web');

  const releaseYear = game.release_date ? game.release_date.split('-')[0] : '';

  const handleDownloadClick = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    // Simulate rapid file generation/stream
    setTimeout(() => {
      onDirectDownload(game);
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 400);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-[#121824] border border-slate-800 hover:border-blue-500/50 rounded-xl overflow-hidden shadow-lg shadow-black/40 transition-all duration-300 flex flex-col sm:flex-row items-center gap-4 p-3 hover:shadow-blue-500/10">
        {/* Banner image */}
        <div className="relative w-full sm:w-44 h-28 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#1a2234]">
          <img
            src={imgSrc}
            alt={game.title}
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onToggleFavorite(game.id)}
            title={isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:scale-110 transition-transform"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-bold text-white truncate max-w-sm" title={game.title}>
              {game.title}
            </h3>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
              {game.genre}
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
            {game.short_description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              {isPc ? <Monitor className="w-3.5 h-3.5 text-cyan-400" /> : <Globe className="w-3.5 h-3.5 text-amber-400" />}
              {game.platform}
            </span>
            {game.publisher && (
              <span className="flex items-center gap-1 truncate max-w-[150px]">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {game.publisher}
              </span>
            )}
            {releaseYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {releaseYear}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
          {isBrowser && (
            <button
              onClick={() => onPlayInBrowser(game)}
              className="flex-1 sm:flex-none text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Play className="w-3.5 h-3.5" />
              <span>เล่นในเว็บนี้</span>
            </button>
          )}

          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className={`flex-1 sm:flex-none text-center px-4 py-2 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md ${
              downloadSuccess
                ? 'bg-emerald-600'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังดาวน์โหลด...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>โหลดสำเร็จ!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดในเว็บ</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenDetail(game)}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#172033] hover:bg-slate-700/80 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>ดูข้อมูล</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid Card Mode
  return (
    <div className="bg-[#121824] border border-[#1e293b] hover:border-blue-500/50 rounded-xl overflow-hidden shadow-lg shadow-black/40 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 group">
      {/* Banner */}
      <div className="relative w-full h-36 bg-[#1a2234] overflow-hidden border-b border-[#1e293b]">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[#1a2234] animate-pulse" />
        )}
        <img
          src={imgSrc}
          alt={game.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgSrc(FALLBACK_IMAGE);
            setImgLoaded(true);
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Platform tag overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium text-slate-200 border border-white/10">
          {isPc ? <Monitor className="w-3 h-3 text-cyan-400" /> : <Globe className="w-3 h-3 text-amber-400" />}
          <span>{isPc ? 'PC Windows' : 'Browser'}</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(game.id)}
          title={isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นเกมโปรด'}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 hover:bg-black text-slate-300 hover:text-white transition-all transform active:scale-90"
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors"
              title={game.title}
            >
              {game.title}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed min-h-[34px]">
            {game.short_description}
          </p>
        </div>

        {/* Meta row */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
            {game.genre}
          </span>
          <span className="truncate max-w-[120px] text-slate-500">
            {releaseYear ? `ปี ${releaseYear}` : game.developer}
          </span>
        </div>
      </div>

      {/* Card Footer with Direct In-Site Actions */}
      <div className="p-3 pt-0 flex flex-col gap-2">
        <div className="flex gap-2">
          {isBrowser ? (
            <button
              onClick={() => onPlayInBrowser(game)}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98"
            >
              <Play className="w-3.5 h-3.5" />
              <span>เล่นในเว็บนี้เลย</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className={`flex-1 py-2 px-3 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98 ${
                downloadSuccess
                  ? 'bg-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังดาวน์โหลด...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>โหลดไฟล์สำเร็จ!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดในเว็บเรา</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onOpenDetail(game)}
            title="ดูรายละเอียด สเปกคอม และภาพเกม"
            className="px-2.5 py-2 bg-[#172033] hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            <Info className="w-4 h-4 text-blue-400" />
          </button>
        </div>

        {/* Alternate button if both play and download apply */}
        {isBrowser && (
          <button
            onClick={handleDownloadClick}
            className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center justify-center gap-1 py-1 hover:underline transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>หรือดาวน์โหลดตัวรันเกมลงเครื่อง</span>
          </button>
        )}
      </div>
    </div>
  );
};
