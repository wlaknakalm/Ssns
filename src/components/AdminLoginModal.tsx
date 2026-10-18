import React, { useState } from 'react';
import { verifyAdminPasscode, setAdminSession } from '../services/adminService';
import { ShieldCheck, Lock, X, KeyRound, AlertTriangle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPasscode(passcode)) {
      setAdminSession(true);
      setError(false);
      setPasscode('');
      onLoginSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyClick = (num: string) => {
    if (passcode.length < 10) {
      setPasscode((prev) => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div
        className={`relative bg-[#0e1422] border border-blue-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-slate-100 flex flex-col items-center ${
          shake ? 'animate-bounce' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/30">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          🔐 ประตูหลังบ้านผู้ดูแลระบบ (Admin)
        </h3>
        <p className="text-xs text-slate-400 text-center mb-5">
          กรอกรหัสผ่านความปลอดภัย 7 หลักเพื่อเข้าสู่ระบบจัดการ GameVault
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(false);
              }}
              placeholder="รหัสผ่านเข้าหลังบ้าน..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl text-center font-mono text-lg tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2 rounded-lg justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง</span>
            </div>
          )}

          {/* Quick Number Pad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleKeyClick(n)}
                className="py-2.5 rounded-lg bg-[#151d2f] hover:bg-slate-700/80 active:bg-blue-600 text-slate-200 text-sm font-semibold transition-all border border-slate-800"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPasscode('')}
              className="py-2.5 rounded-lg bg-[#151d2f] hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all border border-slate-800"
            >
              ล้าง
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              className="py-2.5 rounded-lg bg-[#151d2f] hover:bg-slate-700/80 active:bg-blue-600 text-slate-200 text-sm font-semibold transition-all border border-slate-800"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-lg bg-[#151d2f] hover:bg-slate-700/80 text-slate-400 text-xs font-semibold transition-all border border-slate-800"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>เข้าสู่ระบบหลังบ้าน</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-4 text-center">
          ระบบความปลอดภัยขั้นสูง AETHERIS Executive Security
        </p>
      </div>
    </div>
  );
};
