import React, { useState } from 'react';
import { Gamepad2, ArrowUp, Heart, Shield, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdminLogin,
  isAdminLoggedIn,
  onOpenAdminDashboard,
}) => {
  const [clickCount, setClickCount] = useState(0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSecretClick = () => {
    const next = clickCount + 1;
    if (next >= 3 || isAdminLoggedIn) {
      setClickCount(0);
      if (isAdminLoggedIn) {
        onOpenAdminDashboard();
      } else {
        onOpenAdminLogin();
      }
    } else {
      setClickCount(next);
      setTimeout(() => setClickCount(0), 1500);
    }
  };

  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#0c101a] py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-white text-sm">
            Game<span className="text-blue-500">Vault</span>
          </span>
          <span className="text-slate-600">|</span>
          <p className="text-slate-400">
            &copy; 2026 GameVault. ข้อมูลดึงจาก FreeToGame API แบบอัตโนมัติ
          </p>

          {/* Hidden Admin Key (Discreet) */}
          <button
            onClick={handleSecretClick}
            title={isAdminLoggedIn ? "เข้าสู่แผงควบคุมแอดมิน" : "ระบบความปลอดภัย"}
            className="ml-1 p-1 text-slate-700 hover:text-amber-400 transition-colors rounded opacity-40 hover:opacity-100"
          >
            {isAdminLoggedIn ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Info, Shortcut Hint & Back to top */}
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-[11px] text-slate-600">
            (กดปุ่มลัด <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px]">Ctrl+Shift+A</kbd> เพื่อเข้าสู่ระบบหลังบ้าน)
          </span>

          <span className="flex items-center gap-1 text-slate-500">
            สร้างด้วยความตั้งใจเพื่อคอเกม <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </span>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2c] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition-colors"
          >
            <span>กลับสู่ด้านบน</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
