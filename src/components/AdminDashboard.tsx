import React, { useState } from 'react';
import { Game, AdminSettings } from '../types';
import {
  saveCustomGame,
  saveCustomGameServer,
  deleteCustomGame,
  markGameAsDeleted,
  restoreDeletedGame,
  getDeletedGameIds,
  saveEditedGame,
  getAdminSettings,
  saveAdminSettings,
  exportBackupData,
  importBackupData,
  resetAllAdminOverrides,
} from '../services/adminService';
import { getDownloadHistory } from '../services/downloadService';
import {
  Gamepad2,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Download,
  Upload,
  Settings,
  BarChart3,
  Layers,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  Save,
  X,
  Star,
  Monitor,
  Globe,
  ExternalLink,
  Wrench
} from 'lucide-react';

interface AdminDashboardProps {
  games: Game[];
  onClose: () => void;
  onLogout: () => void;
  onRefreshData: () => void;
  onNotify: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  games,
  onClose,
  onLogout,
  onRefreshData,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'games' | 'stats' | 'downloads' | 'settings'>('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'deleted'>('all');

  // Add / Edit Game Modal State
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AdminSettings>(() => getAdminSettings());
  const [deletedIds, setDeletedIds] = useState<number[]>(() => getDeletedGameIds());

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    short_description: '',
    game_url: '',
    genre: 'Shooter',
    platform: 'PC (Windows)',
    publisher: '',
    developer: '',
    release_date: new Date().toISOString().split('T')[0],
  });

  const downloads = getDownloadHistory();

  // Handle open add modal
  const handleOpenAdd = () => {
    setFormData({
      title: '',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
      short_description: '',
      game_url: '',
      genre: 'Shooter',
      platform: 'PC (Windows)',
      publisher: '',
      developer: '',
      release_date: new Date().toISOString().split('T')[0],
    });
    setIsAddMode(true);
    setEditingGame(null);
  };

  // Handle open edit modal
  const handleOpenEdit = (game: Game) => {
    setFormData({
      title: game.title,
      thumbnail: game.thumbnail,
      short_description: game.short_description,
      game_url: game.game_url,
      genre: game.genre,
      platform: game.platform,
      publisher: game.publisher || '',
      developer: game.developer || '',
      release_date: game.release_date || '',
    });
    setEditingGame(game);
    setIsAddMode(false);
  };

  // Handle save game
  const handleSaveGameForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.game_url.trim()) {
      onNotify('❌ กรุณากรอกชื่อเกมและลิงก์เกมให้ครบถ้วน');
      return;
    }

    if (isAddMode) {
      await saveCustomGameServer({
        ...formData,
        freetogame_profile_url: formData.game_url,
      });
      onNotify(`✅ เพิ่มเกม "${formData.title}" เข้าสู่เซิร์ฟเวอร์สำเร็จ! ผู้ใช้ทุกคนจะเห็นทันที`);
    } else if (editingGame && editingGame.id) {
      if (editingGame.isCustom) {
        await saveCustomGameServer({
          id: editingGame.id,
          ...formData,
          freetogame_profile_url: formData.game_url,
        });
      } else {
        await saveEditedGame(editingGame.id, formData);
      }
      onNotify(`✅ แก้ไขข้อมูลเกม "${formData.title}" บนเซิร์ฟเวอร์เรียบร้อยแล้ว`);
    }

    setEditingGame(null);
    setIsAddMode(false);
    onRefreshData();
  };

  // Handle delete / hide game
  const handleDelete = async (game: Game) => {
    if (confirm(`คุณต้องการลบหรือซ่อนเกม "${game.title}" หรือไม่?`)) {
      if (game.isCustom) {
        await deleteCustomGame(game.id);
      } else {
        await markGameAsDeleted(game.id);
        setDeletedIds(getDeletedGameIds());
      }
      onNotify(`🗑️ ลบเกม "${game.title}" บนเซิร์ฟเวอร์เรียบร้อยแล้ว`);
      onRefreshData();
    }
  };

  // Restore deleted game
  const handleRestore = async (id: number) => {
    await restoreDeletedGame(id);
    setDeletedIds(getDeletedGameIds());
    onNotify('🔄 กู้คืนเกมบนเซิร์ฟเวอร์สำเร็จแล้ว');
    onRefreshData();
  };

  // Save admin settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAdminSettings(settings);
    onNotify('💾 บันทึกการตั้งค่าลงเซิร์ฟเวอร์เรียบร้อยแล้ว (อัปเดตให้ผู้ใช้ทุกคน)');
  };

  // Quick toggle maintenance mode
  const handleQuickToggleMaintenance = async () => {
    const updated = { ...settings, maintenanceMode: !settings.maintenanceMode };
    setSettings(updated);
    await saveAdminSettings(updated);
    if (updated.maintenanceMode) {
      onNotify('🚧 เปิดโหมดปิดปรับปรุงเว็บไซต์แล้ว! (ผู้ใช้ทุกคนบนทุกอุปกรณ์จะเห็นหน้า Maintenance ทันที)');
    } else {
      onNotify('✅ ปิดโหมดปรับปรุงแล้ว! เว็บไซต์กลับมาเปิดให้บริการตามปกติให้ทุกคน');
    }
    onRefreshData();
  };

  // Export backup
  const handleExport = () => {
    const json = exportBackupData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GameVault_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('📦 ส่งออกไฟล์สำรองข้อมูลเรียบร้อยแล้ว');
  };

  // Import backup
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importBackupData(content)) {
        setDeletedIds(getDeletedGameIds());
        setSettings(getAdminSettings());
        onNotify('🎉 นำเข้าข้อมูลสำรองสำเร็จ!');
        onRefreshData();
      } else {
        onNotify('❌ รูปแบบไฟล์ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  // Reset all
  const handleReset = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นจาก API?')) {
      resetAllAdminOverrides();
      setDeletedIds([]);
      onNotify('🔄 รีเซ็ตข้อมูลกลับสู่ค่าเริ่มต้นแล้ว');
      onRefreshData();
    }
  };

  // Filter games list
  const filteredList = games.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.genre.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'custom') return matchesSearch && g.isCustom;
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0d14] text-slate-100 flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Navbar */}
      <header className="bg-[#0f1422] border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                GameVault <span className="text-amber-400">Executive Admin Portal</span>
              </h2>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                หลังบ้านระดับสูง (Passcode Active)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              จัดการเกม, แก้ไขข้อมูล, ตรวจสอบสถิติดาวน์โหลด และตั้งค่าระบบ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Maintenance Mode Toggle */}
          <button
            onClick={handleQuickToggleMaintenance}
            title="เปิด/ปิดการเข้าถึงเว็บไซต์สำหรับบุคคลทั่วไป"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              settings.maintenanceMode
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-[#182136] text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>โหมดปิดปรับปรุง: {settings.maintenanceMode ? 'เปิดใช้งาน (ON)' : 'ปิด (OFF)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#182136] hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าเว็บ</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold border border-red-500/30 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบแอดมิน</span>
          </button>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="bg-[#121828] border-b border-slate-800 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setActiveTab('games')}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'games'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>จัดการคลังเกม ({games.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>สถิติภาพรวม</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'downloads'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>ประวัติดาวน์โหลด ({downloads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ตั้งค่า & สำรองข้อมูล</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {/* TAB 1: GAMES MANAGEMENT */}
        {activeTab === 'games' && (
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131b2c] p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อเกมเพื่อแก้ไขหรือลบ..."
                    className="w-full pl-9 pr-3 py-2 bg-[#0d121c] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0d121c] text-slate-300 hover:text-white'
                  }`}
                >
                  ทั้งหมด ({games.length})
                </button>
                <button
                  onClick={() => setFilterType('custom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0d121c] text-slate-300 hover:text-white'
                  }`}
                >
                  ⭐ เกมที่แอดมินเพิ่มเอง ({games.filter((g) => g.isCustom).length})
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 ml-auto sm:ml-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มเกมใหม่เข้าเว็บ</span>
                </button>
              </div>
            </div>

            {/* Games Table */}
            <div className="bg-[#131b2c] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0e1422] text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">เกม</th>
                      <th className="py-3 px-4">แนวเกม</th>
                      <th className="py-3 px-4">แพลตฟอร์ม</th>
                      <th className="py-3 px-4">ผู้พัฒนา</th>
                      <th className="py-3 px-4">สถานะ</th>
                      <th className="py-3 px-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredList.slice(0, 100).map((game) => (
                      <tr key={game.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={game.thumbnail}
                              alt={game.title}
                              className="w-12 h-8 rounded object-cover bg-slate-900 border border-slate-800"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {game.title}
                                {game.isCustom && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold">
                                    CUSTOM
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                                {game.short_description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px] border border-blue-500/20 font-medium">
                            {game.genre}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          {game.platform}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {game.developer || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3 h-3" /> ออนไลน์
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={game.game_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="เปิดลิงก์เกม"
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleOpenEdit(game)}
                              title="แก้ไขข้อมูลเกม"
                              className="p-1.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(game)}
                              title="ลบหรือซ่อนเกมนี้"
                              className="p-1.5 rounded bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {deletedIds.length > 0 && (
                <div className="p-4 bg-[#0e1422] border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    มีเกมถูกซ่อน/ลบ {deletedIds.length} เกม
                  </span>
                  <div className="flex items-center gap-2">
                    {deletedIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => handleRestore(id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded text-[10px] flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>กู้คืน #{id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STATS */}
        {activeTab === 'stats' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#131b2c] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">จำนวนเกมทั้งหมดในระบบ</span>
                <span className="text-2xl font-black text-white">{games.length}</span>
                <span className="text-[11px] text-blue-400 block mt-1">Free-to-Play Verified</span>
              </div>
              <div className="bg-[#131b2c] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">เกมที่แอดมินเพิ่มเอง</span>
                <span className="text-2xl font-black text-amber-400">
                  {games.filter((g) => g.isCustom).length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Custom Database</span>
              </div>
              <div className="bg-[#131b2c] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">ดาวน์โหลดตรงผ่านเว็บ</span>
                <span className="text-2xl font-black text-emerald-400">{downloads.length}</span>
                <span className="text-[11px] text-emerald-400 block mt-1">Windows Launchers (.bat)</span>
              </div>
              <div className="bg-[#131b2c] border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">เกมที่ถูกซ่อน/ลบ</span>
                <span className="text-2xl font-black text-red-400">{deletedIds.length}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Hidden from Visitors</span>
              </div>
            </div>

            <div className="bg-[#131b2c] border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>ข้อมูลระบบเซิร์ฟเวอร์ & สภาพแวดล้อม (Server Status)</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">แหล่งข้อมูลเกมหลัก:</span>
                  <span className="font-medium text-white">FreeToGame Live API (Automatic Sync)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">ระดับสิทธิ์แอดมิน:</span>
                  <span className="font-medium text-amber-400">👑 Executive Root Admin (0852369)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">ระบบดาวน์โหลดตรง:</span>
                  <span className="font-medium text-emerald-400">เปิดใช้งาน (Direct Browser Blob Streaming)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">ระบบเล่นในเว็บ:</span>
                  <span className="font-medium text-cyan-400">เปิดใช้งาน (Embedded Sandboxed iFrame)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOWNLOAD LOGS */}
        {activeTab === 'downloads' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                <span>บันทึกการดาวน์โหลดไฟล์ตรงผ่านหน้าเว็บ (Download Logs)</span>
              </h3>
              <span className="text-xs text-slate-400">
                ทั้งหมด {downloads.length} รายการ
              </span>
            </div>

            <div className="bg-[#131b2c] border border-slate-800 rounded-xl overflow-hidden">
              {downloads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ยังไม่มีประวัติการดาวน์โหลด
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0e1422] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">เกม</th>
                        <th className="py-3 px-4">ชื่อไฟล์ตัวติดตั้ง</th>
                        <th className="py-3 px-4">ขนาดไฟล์</th>
                        <th className="py-3 px-4">เวลาที่ดาวน์โหลด</th>
                        <th className="py-3 px-4">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {downloads.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-white">{d.gameTitle}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-blue-400">{d.fileName}</td>
                          <td className="py-3 px-4">{d.fileSize}</td>
                          <td className="py-3 px-4 text-slate-400">{d.downloadDate}</td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> สำเร็จ
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & BACKUP */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Backup & Restore */}
            <div className="bg-[#131b2c] border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>สำรองข้อมูล & กู้คืนฐานข้อมูลแอดมิน (Backup & Restore)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                คุณสามารถส่งออกข้อมูลเกมที่คุณเพิ่มเอง หรือการตั้งค่าทั้งหมดเป็นไฟล์ JSON เพื่อนำไปใช้ต่อได้
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>ส่งออกไฟล์สำรอง (Export JSON)</span>
                </button>

                <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors border border-slate-700">
                  <Upload className="w-4 h-4" />
                  <span>นำเข้าไฟล์สำรอง (Import JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-red-500/30 ml-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>รีเซ็ตกลับสู่ค่าเริ่มต้น</span>
                </button>
              </div>
            </div>

            {/* Maintenance Mode Configuration Card */}
            <div className="bg-[#131b2c] border border-amber-500/40 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      ระบบปิดปรับปรุงเว็บไซต์ (Maintenance Mode)
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        settings.maintenanceMode ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {settings.maintenanceMode ? 'เปิดใช้งานอยู่ (ACTIVE)' : 'ปิดการใช้งาน (DISABLED)'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      เมื่อเปิดโหมดนี้ ผู้ใช้งานทั่วไปจะเห็นหน้าแจ้งเตือนปิดปรับปรุง แต่แอดมินยังสามารถเข้าหลังบ้านได้
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleQuickToggleMaintenance}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    settings.maintenanceMode
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{settings.maintenanceMode ? 'ปิดโหมดปรับปรุง (เปิดเว็บ)' : 'เปิดโหมดปิดปรับปรุง'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">
                    หัวข้อหน้าปิดปรับปรุง (Maintenance Title):
                  </label>
                  <input
                    type="text"
                    value={settings.maintenanceTitle || ''}
                    onChange={(e) => setSettings({ ...settings, maintenanceTitle: e.target.value })}
                    placeholder="ระบบกำลังปิดปรับปรุงชั่วคราว"
                    className="w-full px-3.5 py-2.5 bg-[#0d121c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">
                    เวลาที่คาดว่าจะเสร็จสิ้น (Estimated Completion Time):
                  </label>
                  <input
                    type="text"
                    value={settings.maintenanceEstimatedTime || ''}
                    onChange={(e) => setSettings({ ...settings, maintenanceEstimatedTime: e.target.value })}
                    placeholder="เช่น: คาดว่าจะเปิดให้บริการเวลา 23:30 น."
                    className="w-full px-3.5 py-2.5 bg-[#0d121c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  ข้อความชี้แจงผู้ใช้งาน (Maintenance Notice Message):
                </label>
                <textarea
                  rows={2}
                  value={settings.maintenanceMessage || ''}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  placeholder="รายละเอียดสาเหตุและข้อความชี้แจง..."
                  className="w-full px-3.5 py-2.5 bg-[#0d121c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึกข้อความหน้าปิดปรับปรุง</span>
              </button>
            </div>

            {/* Custom Settings Form */}
            <form onSubmit={handleSaveSettings} className="bg-[#131b2c] border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>การปรับแต่งระบบและตัวติดตั้งเกม</span>
              </h3>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  ข้อความแบนเนอร์ประกาศพิเศษ (Announcement):
                </label>
                <input
                  type="text"
                  value={settings.customBannerText || ''}
                  onChange={(e) => setSettings({ ...settings, customBannerText: e.target.value })}
                  placeholder="เช่น: ยินดีต้อนรับสู่ GameVault อัปเดตเกมใหม่ทุกสัปดาห์!"
                  className="w-full px-3.5 py-2.5 bg-[#0d121c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  ลายเซ็นชื่อระบบในตัวติดตั้ง .bat (Signature):
                </label>
                <input
                  type="text"
                  value={settings.installerSignature}
                  onChange={(e) => setSettings({ ...settings, installerSignature: e.target.value })}
                  placeholder="GameVault Executive Engine v3.7"
                  className="w-full px-3.5 py-2.5 bg-[#0d121c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="batDownloadToggle"
                  checked={settings.allowDirectBatDownload}
                  onChange={(e) => setSettings({ ...settings, allowDirectBatDownload: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="batDownloadToggle" className="text-xs text-slate-300">
                  เปิดให้ดาวน์โหลดตัวติดตั้งตรงลงเครื่อง (Direct In-Site Launcher Generator)
                </label>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/30"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการตั้งค่าระบบ</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Game Form */}
      {(isAddMode || editingGame) && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div
            className="relative bg-[#101624] border border-blue-500/40 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-slate-100 custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isAddMode ? '➕ เพิ่มเกมใหม่เข้าสู่ GameVault' : '✏️ แก้ไขข้อมูลเกม'}
              </h3>
              <button
                onClick={() => {
                  setIsAddMode(false);
                  setEditingGame(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGameForm} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">ชื่อเกม (Game Title)*:</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น: Cyberpunk Online 2026"
                  className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">แนวเกม (Genre):</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Shooter">Shooter</option>
                    <option value="MMORPG">MMORPG</option>
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="Action RPG">Action RPG</option>
                    <option value="Strategy">Strategy</option>
                    <option value="MOBA">MOBA</option>
                    <option value="Fighting">Fighting</option>
                    <option value="Racing">Racing</option>
                    <option value="Card Game">Card Game</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">แพลตฟอร์ม (Platform):</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="PC (Windows)">PC (Windows)</option>
                    <option value="Web Browser">Web Browser</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">ลิงก์ภาพแบนเนอร์ (Thumbnail URL):</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">ลิงก์ดาวน์โหลดหรือหน้าเล่นเกม (Game URL)*:</label>
                <input
                  type="url"
                  required
                  value={formData.game_url}
                  onChange={(e) => setFormData({ ...formData, game_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">คำอธิบายสั้น (Short Description):</label>
                <textarea
                  rows={2}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="รายละเอียดสั้นๆ ของเกมเพื่อแสดงในการ์ด..."
                  className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">ผู้พัฒนา (Developer):</label>
                  <input
                    type="text"
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    placeholder="Game Studio"
                    className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">ผู้จัดจำหน่าย (Publisher):</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Publisher Inc."
                    className="w-full px-3 py-2 bg-[#0c1018] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMode(false);
                    setEditingGame(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกข้อมูลเกม</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
