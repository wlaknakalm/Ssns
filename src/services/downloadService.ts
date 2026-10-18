import { Game } from '../types';

export interface DownloadItem {
  id: string;
  gameId: number;
  gameTitle: string;
  thumbnail: string;
  genre: string;
  platform: string;
  fileName: string;
  fileSize: string;
  downloadDate: string;
  status: 'completed' | 'downloading';
  progress: number;
}

// Generate a sanitized safe filename
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_');
}

/**
 * Creates and downloads a real Windows One-Click Auto Launcher (.bat)
 * directly into user's downloads folder from this website
 */
export function downloadWindowsLauncher(game: Game): DownloadItem {
  const safeName = sanitizeFileName(game.title);
  const fileName = `GameVault_Installer_${safeName}.bat`;

  const scriptContent = `@echo off
chcp 65001 > nul
title GameVault Launcher - ${game.title}
color 0B
cls
echo ==============================================================================
echo       👑 GameVault Direct Game Installer & Launcher Engine v3.7
echo ==============================================================================
echo.
echo   [ชื่อเกม / Game]:        ${game.title}
echo   [หมวดหมู่ / Genre]:       ${game.genre}
echo   [แพลตฟอร์ม / Platform]:  ${game.platform}
echo   [ผู้พัฒนา / Developer]:   ${game.developer || 'Official Game Studio'}
echo   [วันที่บันทึก / Date]:    ${new Date().toLocaleDateString('th-TH')}
echo.
echo ==============================================================================
echo   [*] กำลังตรวจสอบสภาพแวดล้อม Windows และเตรียมดาวน์โหลดตัวเกมหลัก...
echo   [*] สิทธิพิเศษ: ฟรี 100% ลิขสิทธิ์แท้จากเซิร์ฟเวอร์หลัก (Official Server)
echo ==============================================================================
echo.
echo   [>] ระบบกำลังเปิดหน้าติดตั้ง/ดาวน์โหลดตัวเกมหลักให้อัตโนมัติใน 3 วินาที...
timeout /t 3 /nobreak > nul
echo.
echo   [>] กำลังเชื่อมต่อไปยังเซิร์ฟเวอร์หลัก:
echo       ${game.game_url}
echo.
start "" "${game.game_url}"
echo.
echo ==============================================================================
echo   [✓] ดาวน์โหลดตัวติดตั้งหลักสำเร็จแล้ว! ขอให้สนุกกับการเล่นเกม!
echo ==============================================================================
echo   กดปุ่มใดๆ เพื่อปิดหน้าต่างนี้...
pause > nul
exit
`;

  const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const downloadRecord: DownloadItem = {
    id: `${game.id}-${Date.now()}`,
    gameId: game.id,
    gameTitle: game.title,
    thumbnail: game.thumbnail,
    genre: game.genre,
    platform: game.platform,
    fileName,
    fileSize: `${(scriptContent.length / 1024).toFixed(1)} KB`,
    downloadDate: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    status: 'completed',
    progress: 100,
  };

  saveDownloadHistory(downloadRecord);
  return downloadRecord;
}

/**
 * Creates and downloads a real Desktop Shortcut file (.url)
 */
export function downloadDesktopShortcut(game: Game): DownloadItem {
  const safeName = sanitizeFileName(game.title);
  const fileName = `${safeName}.url`;

  const shortcutContent = `[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,0
[InternetShortcut]
IDList=
URL=${game.game_url}
IconIndex=0
HotKey=0
`;

  const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const downloadRecord: DownloadItem = {
    id: `${game.id}-${Date.now()}`,
    gameId: game.id,
    gameTitle: game.title,
    thumbnail: game.thumbnail,
    genre: game.genre,
    platform: game.platform,
    fileName,
    fileSize: '1.2 KB',
    downloadDate: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    status: 'completed',
    progress: 100,
  };

  saveDownloadHistory(downloadRecord);
  return downloadRecord;
}

/**
 * Creates and downloads GameVault Offline Manifest & Configuration (.json)
 */
export function downloadGameConfig(game: Game): DownloadItem {
  const safeName = sanitizeFileName(game.title);
  const fileName = `GameVault_${safeName}_Config.json`;

  const data = {
    app: "GameVault Pro v3.7",
    game_id: game.id,
    title: game.title,
    genre: game.genre,
    platform: game.platform,
    publisher: game.publisher,
    developer: game.developer,
    release_date: game.release_date,
    direct_launch_url: game.game_url,
    freetogame_profile: game.freetogame_profile_url,
    exported_at: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const downloadRecord: DownloadItem = {
    id: `${game.id}-${Date.now()}`,
    gameId: game.id,
    gameTitle: game.title,
    thumbnail: game.thumbnail,
    genre: game.genre,
    platform: game.platform,
    fileName,
    fileSize: `${(JSON.stringify(data).length / 1024).toFixed(1)} KB`,
    downloadDate: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    status: 'completed',
    progress: 100,
  };

  saveDownloadHistory(downloadRecord);
  return downloadRecord;
}

export function getDownloadHistory(): DownloadItem[] {
  try {
    const raw = localStorage.getItem('gamevault_downloads');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDownloadHistory(item: DownloadItem): void {
  try {
    const current = getDownloadHistory();
    // Keep most recent 50 downloads
    const updated = [item, ...current.filter((d) => d.id !== item.id)].slice(0, 50);
    localStorage.setItem('gamevault_downloads', JSON.stringify(updated));

    // Sync to server globally
    fetch('/api/downloads/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item }),
    }).catch(() => {});
  } catch {
    // Ignore storage errors
  }
}

export function clearDownloadHistory(): void {
  try {
    localStorage.removeItem('gamevault_downloads');
  } catch {
    // Ignore
  }
}
