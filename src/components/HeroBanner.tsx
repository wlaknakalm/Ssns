import React from 'react';
import { Search, Flame, Monitor, Globe, ShieldCheck, Zap } from 'lucide-react';

interface HeroBannerProps {
  totalGames: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  featuredGenres: string[];
  activeGenre: string;
  onSelectGenre: (genre: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalGames,
  filteredCount,
  searchQuery,
  onSearchChange,
  onClearSearch,
  featuredGenres,
  activeGenre,
  onSelectGenre,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-8 border-b border-slate-800/80 bg-gradient-to-b from-[#121826] via-[#0d121c] to-[#0b0e14]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>ฐานข้อมูลเกมออนไลน์ Free-to-Play ล่าสุดประจำปี 2026</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
          คลังเกมออนไลน์จาก<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">เซิร์ฟเวอร์จริง</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-6">
          ระบบดึงข้อมูลและลิงก์ดาวน์โหลดจากฐานข้อมูลภายนอกแบบอัตโนมัติ รวบรวมเกมยอดฮิต สเปกคอมพิวเตอร์ และภาพตัวอย่างจริง
        </p>

        {/* Search input with sleek styling */}
        <div className="max-w-2xl mx-auto relative mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาชื่อเกม เช่น Overwatch, PUBG, Genshin, แนวเกม หรือผู้พัฒนา..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#172033] border border-blue-500/30 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-lg shadow-black/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3.5 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        {/* Quick Genre Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            หมวดหมู่ยอดนิยม:
          </span>
          {featuredGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`px-3 py-1 rounded-full transition-all text-xs font-medium ${
                activeGenre === genre
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400'
                  : 'bg-[#161d2c] text-slate-300 hover:bg-[#1f293d] hover:text-white border border-slate-700/60'
              }`}
            >
              {genre === 'all' ? 'ทั้งหมด' : genre}
            </button>
          ))}
        </div>

        {/* Feature stats counters */}
        <div className="mt-7 pt-6 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="bg-[#121824]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white">{totalGames || '...'} เกม</div>
              <div className="text-[11px] text-slate-400">ในฐานข้อมูลเซิร์ฟเวอร์</div>
            </div>
          </div>

          <div className="bg-[#121824]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white">PC & Web</div>
              <div className="text-[11px] text-slate-400">รองรับวินโดวส์และเบราว์เซอร์</div>
            </div>
          </div>

          <div className="bg-[#121824]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white">100% Free</div>
              <div className="text-[11px] text-slate-400">เล่นฟรีอย่างเป็นทางการ</div>
            </div>
          </div>

          <div className="bg-[#121824]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white">{filteredCount} เกม</div>
              <div className="text-[11px] text-slate-400">ตรงตามเงื่อนไขที่ค้นหา</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
