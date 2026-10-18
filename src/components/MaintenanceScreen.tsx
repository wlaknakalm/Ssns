import React, { useState } from 'react';
import { AdminSettings } from '../types';
import { Wrench, ShieldAlert, Clock, RefreshCw, Lock, Sparkles, Server } from 'lucide-react';

interface MaintenanceScreenProps {
  settings: AdminSettings;
  onRefresh: () => void;
  onOpenAdminLogin: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  settings,
  onRefresh,
  onOpenAdminLogin,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSecretClick = () => {
    const next = secretClicks + 1;
    if (next >= 3) {
      setSecretClicks(0);
      onOpenAdminLogin();
    } else {
      setSecretClicks(next);
      setTimeout(() => setSecretClicks(0), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Poppins','Prompt',sans-serif]">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative max-w-xl w-full bg-[#0d121c]/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 text-center shadow-2xl shadow-black/80 backdrop-blur-xl">
        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
            <Wrench className="w-10 h-10 animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ระบบปิดปรับปรุงชั่วคราว (Maintenance Mode Active)</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          {settings.maintenanceTitle || 'ระบบกำลังปิดปรับปรุงชั่วคราว'}
        </h1>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-md mx-auto">
          {settings.maintenanceMessage ||
            'GameVault กำลังดำเนินการอัปเกรดเซิร์ฟเวอร์และระบบความปลอดภัย ขออภัยในความไม่สะดวก กรุณากลับมาใหม่อีกครั้งในภายหลัง'}
        </p>

        {/* Estimated Time Card */}
        {settings.maintenanceEstimatedTime && (
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-3.5 mb-6 max-w-sm mx-auto flex items-center justify-center gap-2.5 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-medium text-amber-200">
              {settings.maintenanceEstimatedTime}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>ตรวจสอบสถานะอีกครั้ง</span>
          </button>
        </div>

        {/* System Specs Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-slate-600" />
            GameVault Core Gateway v3.7
          </span>

          {/* Hidden Admin Entry Link */}
          <button
            onClick={handleSecretClick}
            title="สำหรับผู้ดูแลระบบเข้าจัดการ"
            className="flex items-center gap-1 text-slate-600 hover:text-amber-400 transition-colors p-1"
          >
            <Lock className="w-3 h-3" />
            <span>โหมดผู้ดูแลระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
