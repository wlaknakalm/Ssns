import React from 'react';
import { PlatformFilter, SortOption } from '../types';
import { Monitor, Globe, Layers, ArrowUpDown, LayoutGrid, List, CheckCircle2 } from 'lucide-react';

interface ControlsProps {
  filteredCount: number;
  totalGames: number;
  platform: PlatformFilter;
  onPlatformChange: (platform: PlatformFilter) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  availableGenres: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  apiStatusText: string;
}

export const Controls: React.FC<ControlsProps> = ({
  filteredCount,
  totalGames,
  platform,
  onPlatformChange,
  genre,
  onGenreChange,
  availableGenres,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  apiStatusText,
}) => {
  return (
    <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 mb-6 shadow-md shadow-black/30">
      {/* Top Status Bar (Matching Prompt Requirements) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs gap-2">
        <div className="font-semibold text-slate-300 flex items-center gap-2">
          <span>แสดงทั้งหมด:</span>
          <span className="text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 text-sm">
            {filteredCount} เกม
          </span>
          {filteredCount !== totalGames && (
            <span className="text-slate-500 font-normal">
              (จาก {totalGames} เกมทั้งหมด)
            </span>
          )}
        </div>
        <div className="text-slate-400 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span>สถานะ: <span className="text-blue-400">{apiStatusText}</span></span>
        </div>
      </div>

      {/* Filter and Control Rows */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Platform selection pills */}
        <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onPlatformChange('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              platform === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ทุกแพลตฟอร์ม</span>
          </button>
          <button
            onClick={() => onPlatformChange('pc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              platform === 'pc'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC (Windows)</span>
          </button>
          <button
            onClick={() => onPlatformChange('browser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              platform === 'browser'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Browser</span>
          </button>
        </div>

        {/* Dropdowns & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Genre select */}
          <div className="flex items-center gap-1 text-xs">
            <label htmlFor="genre-select" className="text-slate-400 hidden md:inline">แนวเกม:</label>
            <select
              id="genre-select"
              value={genre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="bg-[#172033] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">แนวเกมทั้งหมด</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort option */}
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-[#172033] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="relevance">เรียงตาม: แนะนำ / ยอดนิยม</option>
              <option value="newest">เรียงตาม: ล่าสุด (Release Date)</option>
              <option value="az">เรียงตาม: ชื่อเกม (A - Z)</option>
              <option value="za">เรียงตาม: ชื่อเกม (Z - A)</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#0b0e14] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onViewModeChange('grid')}
              title="มุมมองตารางการ์ด (Grid)"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="มุมมองรายการ (Compact List)"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
