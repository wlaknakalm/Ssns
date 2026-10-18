import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Game, PlatformFilter, SortOption } from './types';
import { getRealGames } from './services/gameApi';
import {
  downloadWindowsLauncher,
  getDownloadHistory,
  DownloadItem,
} from './services/downloadService';
import {
  isAdminAuthenticated,
  setAdminSession,
  getCustomGames,
  getDeletedGameIds,
  getEditedGames,
  getAdminSettings,
  saveAdminSettings,
  fetchServerState,
} from './services/adminService';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { Controls } from './components/Controls';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { RandomGameModal } from './components/RandomGameModal';
import { InGameBrowserModal } from './components/InGameBrowserModal';
import { DownloadManagerModal } from './components/DownloadManagerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { Footer } from './components/Footer';
import { Loader2, AlertCircle, RefreshCw, ChevronDown, Check, Download, Bell, Wrench } from 'lucide-react';

const POPULAR_GENRES = ['all', 'Shooter', 'MMORPG', 'Battle Royale', 'Action RPG', 'Strategy', 'MOBA', 'Fighting', 'Card Game'];
const ITEMS_PER_PAGE = 24;

export default function App() {
  const [baseGames, setBaseGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [apiStatus, setApiStatus] = useState({
    connected: false,
    latency: 0,
    source: 'กำลังเชื่อมต่อ...',
    loading: true,
  });

  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => isAdminAuthenticated());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminSettings, setAdminSettings] = useState(() => getAdminSettings());

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Favorites
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('gamevault_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Downloads history
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => getDownloadHistory());

  // Modals
  const [detailGame, setDetailGame] = useState<Game | null>(null);
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [browserPlayGame, setBrowserPlayGame] = useState<Game | null>(null);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Keyboard shortcut for Hidden Admin Portal: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdminAuthenticated()) {
          setIsAdminDashboardOpen((prev) => !prev);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle favorite
  const handleToggleFavorite = (id: number) => {
    setFavorites((prev) => {
      let updated: number[];
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
        triggerToast('นำออกจากรายการโปรดแล้ว');
      } else {
        updated = [...prev, id];
        triggerToast('⭐ เพิ่มลงรายการโปรดเรียบร้อย');
      }
      try {
        localStorage.setItem('gamevault_favorites', JSON.stringify(updated));
      } catch {
        // localStorage not available
      }
      return updated;
    });
  };

  // Direct In-Site Download
  const handleDirectDownload = (game: Game) => {
    downloadWindowsLauncher(game);
    setDownloads(getDownloadHistory());
    triggerToast(`📥 ดาวน์โหลดตัวติดตั้ง ${game.title} ลงเครื่องของคุณเรียบร้อย!`);
  };

  // Redownload from download manager
  const handleRedownload = (item: DownloadItem) => {
    const targetGame = baseGames.find((g) => g.id === item.gameId) || {
      id: item.gameId,
      title: item.gameTitle,
      thumbnail: item.thumbnail,
      short_description: '',
      game_url: '',
      genre: item.genre,
      platform: item.platform,
      publisher: '',
      developer: '',
      release_date: '',
      freetogame_profile_url: '',
    };
    downloadWindowsLauncher(targetGame);
    triggerToast(`📥 กำลังดาวน์โหลด ${item.gameTitle} ซ้ำอีกครั้ง...`);
  };

  // Play in Browser directly on this site
  const handlePlayInBrowser = (game: Game) => {
    setBrowserPlayGame(game);
  };

  // Fetch games
  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    setApiStatus((prev) => ({ ...prev, loading: true }));

    try {
      const res = await getRealGames();
      setBaseGames(res.games);
      setApiStatus({
        connected: res.isRealApi,
        latency: res.latency,
        source: res.source,
        loading: false,
      });
      setAdminSettings(getAdminSettings());
      if (res.isRealApi) {
        triggerToast(`🚀 เชื่อมต่อสำเร็จ ${res.games.length} เกม (${res.latency}ms)`);
      }
    } catch (err) {
      console.error('Failed to load games:', err);
      setError('ไม่สามารถเชื่อมต่อเพื่อดึงข้อมูลเกมได้ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ');
      setApiStatus({
        connected: false,
        latency: 0,
        source: 'ข้อผิดพลาดการเชื่อมต่อ',
        loading: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const [serverSyncVersion, setServerSyncVersion] = useState(0);

  // Real-time server sync polling: updates every 3 seconds for all users!
  useEffect(() => {
    let isMounted = true;
    const syncWithServer = async () => {
      const serverState = await fetchServerState();
      if (!isMounted || !serverState) return;

      setAdminSettings((prev) => {
        if (
          prev.maintenanceMode !== serverState.maintenanceMode ||
          prev.customBannerText !== serverState.customBannerText ||
          prev.maintenanceTitle !== serverState.maintenanceTitle ||
          prev.maintenanceMessage !== serverState.maintenanceMessage ||
          prev.maintenanceEstimatedTime !== serverState.maintenanceEstimatedTime
        ) {
          return {
            ...prev,
            maintenanceMode: serverState.maintenanceMode,
            maintenanceTitle: serverState.maintenanceTitle,
            maintenanceMessage: serverState.maintenanceMessage,
            maintenanceEstimatedTime: serverState.maintenanceEstimatedTime,
            customBannerText: serverState.customBannerText,
          };
        }
        return prev;
      });

      setServerSyncVersion((v) => v + 1);
    };

    // Initial sync
    syncWithServer();

    // Poll every 3 seconds for real-time reactivity across all visitors
    const interval = setInterval(syncWithServer, 3000);

    const handleFocus = () => syncWithServer();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Combine live games with Admin Custom games & overrides
  const allGames = useMemo(() => {
    const customGames = getCustomGames();
    const deletedIds = getDeletedGameIds();
    const editedMap = getEditedGames();

    // Filter out deleted API games and apply edited overrides
    const activeApiGames = baseGames
      .filter((g) => !deletedIds.includes(g.id))
      .map((g) => (editedMap[g.id] ? { ...g, ...editedMap[g.id] } : g));

    // Custom games appear first
    return [...customGames, ...activeApiGames];
  }, [baseGames, serverSyncVersion]);

  // Compute available genres dynamically
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    allGames.forEach((g) => {
      if (g.genre) set.add(g.genre.trim());
    });
    return Array.from(set).sort();
  }, [allGames]);

  // Filtered & Sorted Games
  const filteredGames = useMemo(() => {
    let result = [...allGames];

    // Search keyword
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q) ||
          (g.publisher && g.publisher.toLowerCase().includes(q)) ||
          (g.developer && g.developer.toLowerCase().includes(q)) ||
          (g.short_description && g.short_description.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter(
        (g) => g.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    // Platform filter
    if (selectedPlatform === 'pc') {
      result = result.filter(
        (g) =>
          g.platform.toLowerCase().includes('windows') ||
          g.platform.toLowerCase().includes('pc')
      );
    } else if (selectedPlatform === 'browser') {
      result = result.filter(
        (g) =>
          g.platform.toLowerCase().includes('browser') ||
          g.platform.toLowerCase().includes('web')
      );
    }

    // Favorites only
    if (showFavoritesOnly) {
      result = result.filter((g) => favorites.includes(g.id));
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'az') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'za') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [allGames, searchQuery, selectedGenre, selectedPlatform, showFavoritesOnly, favorites, sortBy]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedGenre, selectedPlatform, showFavoritesOnly, sortBy]);

  const displayedGames = useMemo(() => {
    return filteredGames.slice(0, visibleCount);
  }, [filteredGames, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredGames.length));
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
    triggerToast('👑 ปลดล็อกหลังบ้านแอดมินเรียบร้อยแล้ว!');
  };

  const handleAdminLogout = () => {
    setAdminSession(false);
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
    triggerToast('🔒 ออกจากระบบแอดมินเรียบร้อยแล้ว');
  };

  // Check Maintenance Mode: If active and visitor is not logged in as admin
  if (adminSettings.maintenanceMode && !isAdminLoggedIn) {
    return (
      <>
        <MaintenanceScreen
          settings={adminSettings}
          onRefresh={() => {
            const latest = getAdminSettings();
            setAdminSettings(latest);
            loadGames();
          }}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        />
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#172033] border border-blue-500/40 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-['Poppins','Prompt',sans-serif]">
      {/* Maintenance Mode Active Notice for Admin */}
      {adminSettings.maintenanceMode && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 animate-bounce" />
            <span>
              [โหมดแอดมิน] เว็บไซต์กำลังอยู่ในสถานะ "ปิดปรับปรุง" (บุคคลทั่วไปไม่สามารถเข้าใช้งานได้)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const updated = { ...adminSettings, maintenanceMode: false };
                setAdminSettings(updated);
                saveAdminSettings(updated);
                triggerToast('✅ ปิดโหมดปรับปรุงแล้ว! เว็บไซต์เปิดให้บริการตามปกติ');
              }}
              className="px-3 py-1 bg-black text-amber-300 hover:bg-slate-900 rounded font-semibold text-xs transition-colors cursor-pointer"
            >
              เปิดให้บริการเว็บทันที (ปิดโหมดปรับปรุง)
            </button>
            <button
              onClick={() => setIsAdminDashboardOpen(true)}
              className="px-3 py-1 bg-amber-700 text-white hover:bg-amber-800 rounded font-semibold text-xs transition-colors cursor-pointer"
            >
              เปิดหลังบ้านแอดมิน
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        apiStatus={apiStatus}
        onRefresh={loadGames}
        favoritesCount={favorites.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly((prev) => !prev)}
        onOpenRandom={() => setIsRandomOpen(true)}
        downloadsCount={downloads.length}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* Admin Custom Announcement Banner if configured */}
      {adminSettings.customBannerText && (
        <div className="bg-gradient-to-r from-amber-600/30 via-yellow-600/20 to-amber-600/30 border-b border-amber-500/30 py-2 px-4 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>{adminSettings.customBannerText}</span>
        </div>
      )}

      {/* Hero Banner */}
      <HeroBanner
        totalGames={allGames.length}
        filteredCount={filteredGames.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        featuredGenres={POPULAR_GENRES}
        activeGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
      />

      {/* Direct In-Site Download Notification Feature Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-indigo-900/40 border-y border-blue-500/20 py-2.5 px-4 text-center text-xs text-blue-200">
        <span className="font-semibold text-white">⚡ ระบบดาวน์โหลดในเว็บโดยตรง:</span> กดปุ่ม{' '}
        <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
          <Download className="w-3 h-3" /> ดาวน์โหลดในเว็บเรา
        </span>{' '}
        เพื่อรับไฟล์ติดตั้งเกมลงเครื่องได้ทันทีไม่ต้องไปเปิดเว็บอื่น หรือกด{' '}
        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-medium">เล่นในเว็บนี้เลย</span> เพื่อเล่นเกมบนเบราว์เซอร์ได้ทันที
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Controls Bar */}
        <Controls
          filteredCount={filteredGames.length}
          totalGames={allGames.length}
          platform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          genre={selectedGenre}
          onGenreChange={setSelectedGenre}
          availableGenres={availableGenres}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          apiStatusText={apiStatus.connected ? 'เชื่อมต่อสำเร็จ (Live)' : 'ใช้งานแคช'}
        />

        {/* Content Area */}
        {loading && allGames.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-blue-400">
              🔄 กำลังเชื่อมต่อและดึงข้อมูลเกมจากเว็บจริง... กรุณารอสักครู่
            </p>
            <p className="text-xs text-slate-500 mt-1">
              กำลังประสานงานกับ FreeToGame Server Gateway
            </p>
          </div>
        ) : error && allGames.length === 0 ? (
          <div className="py-16 text-center bg-[#131b2c] border border-red-500/30 rounded-2xl p-8 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-2">ไม่สามารถเชื่อมต่อได้</h3>
            <p className="text-xs text-slate-400 mb-5">{error}</p>
            <button
              onClick={loadGames}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ลองใหม่อีกครั้ง</span>
            </button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-20 text-center bg-[#121824] border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              🔍
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              ไม่พบเกมที่คุณค้นหา
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {showFavoritesOnly
                ? 'คุณยังไม่มีรายการเกมโปรด ลองกดไอคอนดาวที่การ์ดเกมเพื่อบันทึก'
                : 'ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูสิ'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setSelectedPlatform('all');
                setShowFavoritesOnly(false);
              }}
              className="px-4 py-2 bg-[#1b253b] hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/20 transition-all"
            >
              รีเซ็ตการค้นหาทั้งหมด
            </button>
          </div>
        ) : (
          <div>
            {/* Grid or List View */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  : 'flex flex-col gap-3'
              }
            >
              {displayedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFavorite={favorites.includes(game.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenDetail={(g) => setDetailGame(g)}
                  onDirectDownload={handleDirectDownload}
                  onPlayInBrowser={handlePlayInBrowser}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayedGames.length < filteredGames.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-[#131b2c] hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md group"
                >
                  <span>
                    แสดงเกมเพิ่มเติม (+{Math.min(ITEMS_PER_PAGE, filteredGames.length - displayedGames.length)} เกม)
                  </span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  กำลังแสดง {displayedGames.length} จากทั้งหมด {filteredGames.length} เกม
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer with Hidden Admin Entrance */}
      <Footer
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Detail Modal */}
      {detailGame && (
        <GameDetailModal
          game={detailGame}
          onClose={() => setDetailGame(null)}
          isFavorite={favorites.includes(detailGame.id)}
          onToggleFavorite={handleToggleFavorite}
          onPlayInBrowser={handlePlayInBrowser}
          onNotify={triggerToast}
        />
      )}

      {/* Random Game Modal */}
      <RandomGameModal
        games={allGames}
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
        onOpenDetail={(g) => setDetailGame(g)}
      />

      {/* In-Game Browser Play Modal (No leaving the site) */}
      {browserPlayGame && (
        <InGameBrowserModal
          game={browserPlayGame}
          onClose={() => setBrowserPlayGame(null)}
        />
      )}

      {/* Download Manager Modal */}
      <DownloadManagerModal
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        downloads={downloads}
        onRefresh={() => setDownloads(getDownloadHistory())}
        onRedownload={handleRedownload}
      />

      {/* Secret Admin Login Modal (Passcode: 0852369) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Executive Dashboard Portal */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          games={allGames}
          onClose={() => setIsAdminDashboardOpen(false)}
          onLogout={handleAdminLogout}
          onRefreshData={loadGames}
          onNotify={triggerToast}
        />
      )}

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#172033] border border-blue-500/40 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
