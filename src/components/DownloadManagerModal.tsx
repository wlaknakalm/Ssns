import React from 'react';
import { DownloadItem, clearDownloadHistory } from '../services/downloadService';
import { X, Download, CheckCircle, Trash2, FileCode, ExternalLink, HardDrive } from 'lucide-react';

interface DownloadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: DownloadItem[];
  onRefresh: () => void;
  onRedownload: (item: DownloadItem) => void;
}

export const DownloadManagerModal: React.FC<DownloadManagerModalProps> = ({
  isOpen,
  onClose,
  downloads,
  onRefresh,
  onRedownload,
}) => {
  if (!isOpen) return null;

  const handleClear = () => {
    clearDownloadHistory();
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-[#101623] border border-blue-500/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#141b2a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ศูนย์ดาวน์โหลดในเว็บ GameVault
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                  {downloads.length} รายการ
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                ประวัติไฟล์ติดตั้งและตัวรันเกมที่ดาวน์โหลดลงเครื่องคุณโดยตรง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {downloads.length > 0 && (
              <button
                onClick={handleClear}
                title="ล้างประวัติดาวน์โหลด"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors text-xs flex items-center gap-1 px-2.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างประวัติ</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {downloads.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">ยังไม่มีประวัติดาวน์โหลด</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                กดปุ่ม "📥 ดาวน์โหลดในเว็บเรา" บนการ์ดเกมใดก็ได้ เพื่อดาวน์โหลดตัวติดตั้งเกมลงเครื่องของคุณได้ทันที!
              </p>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="bg-[#151c2d] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnail}
                    alt={item.gameTitle}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                      {item.gameTitle}
                    </h4>
                    <p className="text-[11px] text-blue-400 flex items-center gap-1 truncate font-mono">
                      <FileCode className="w-3 h-3 flex-shrink-0" />
                      <span>{item.fileName}</span>
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>ขนาด: {item.fileSize}</span>
                      <span>•</span>
                      <span>เวลา: {item.downloadDate}</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> ดาวน์โหลดเสร็จสิ้น
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onRedownload(item)}
                    title="ดาวน์โหลดไฟล์นี้อีกครั้ง"
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-medium border border-blue-500/30 transition-all flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">โหลดซ้ำ</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#141b2a] border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ไฟล์ตัวติดตั้งและ Launcher ปลอดภัย 100% ไร้ไวรัส สิทธิพิเศษจาก GameVault
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
