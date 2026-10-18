import { Game, AdminSettings } from '../types';

export const ADMIN_PASSCODE = '0852369';
const STORAGE_ADMIN_AUTH = 'gamevault_admin_auth';
const STORAGE_CUSTOM_GAMES = 'gamevault_custom_games';
const STORAGE_DELETED_GAMES = 'gamevault_deleted_game_ids';
const STORAGE_EDITED_GAMES = 'gamevault_edited_games';
const STORAGE_ADMIN_SETTINGS = 'gamevault_admin_settings';

export interface ServerSyncState {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceEstimatedTime: string;
  customBannerText: string;
  customGames: Game[];
  deletedGameIds: number[];
  editedGames: Record<string, Partial<Game>>;
  downloads: any[];
  updatedAt: number;
}

// Check admin passcode locally and with server
export async function verifyAdminPasscodeServer(passcode: string): Promise<boolean> {
  if (passcode.trim() !== ADMIN_PASSCODE) return false;
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    return res.ok;
  } catch {
    // If offline fallback
    return passcode.trim() === ADMIN_PASSCODE;
  }
}

export function verifyAdminPasscode(inputCode: string): boolean {
  return inputCode.trim() === ADMIN_PASSCODE;
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_ADMIN_AUTH) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(STORAGE_ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_ADMIN_AUTH);
    }
  } catch {
    // Ignore
  }
}

// Fetch global state from server (Called by all visitors every 3s or on load)
export async function fetchServerState(): Promise<ServerSyncState | null> {
  try {
    const res = await fetch('/api/public/state', { cache: 'no-store' });
    if (res.ok) {
      const data: ServerSyncState = await res.json();
      // Sync into local cache
      if (typeof data.maintenanceMode === 'boolean') {
        const settings = getAdminSettings();
        settings.maintenanceMode = data.maintenanceMode;
        settings.maintenanceTitle = data.maintenanceTitle;
        settings.maintenanceMessage = data.maintenanceMessage;
        settings.maintenanceEstimatedTime = data.maintenanceEstimatedTime;
        settings.customBannerText = data.customBannerText;
        localStorage.setItem(STORAGE_ADMIN_SETTINGS, JSON.stringify(settings));
      }
      if (Array.isArray(data.customGames)) {
        localStorage.setItem(STORAGE_CUSTOM_GAMES, JSON.stringify(data.customGames));
      }
      if (Array.isArray(data.deletedGameIds)) {
        localStorage.setItem(STORAGE_DELETED_GAMES, JSON.stringify(data.deletedGameIds));
      }
      if (data.editedGames) {
        localStorage.setItem(STORAGE_EDITED_GAMES, JSON.stringify(data.editedGames));
      }
      return data;
    }
  } catch (err) {
    // Server not reachable yet
  }
  return null;
}

// Toggle maintenance mode on server
export async function syncMaintenanceMode(
  maintenanceMode: boolean,
  maintenanceTitle?: string,
  maintenanceMessage?: string,
  maintenanceEstimatedTime?: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: ADMIN_PASSCODE,
        maintenanceMode,
        maintenanceTitle,
        maintenanceMessage,
        maintenanceEstimatedTime,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Custom Games Management
export function getCustomGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_GAMES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCustomGameServer(game: Omit<Game, 'id'> & { id?: number }): Promise<Game> {
  const current = getCustomGames();
  const id = game.id || Date.now() + Math.floor(Math.random() * 1000);
  const newGame: Game = {
    ...game,
    id,
    isCustom: true,
    freetogame_profile_url: game.freetogame_profile_url || game.game_url,
  };

  const existingIndex = current.findIndex((g) => g.id === id);
  let updated: Game[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = newGame;
  } else {
    updated = [newGame, ...current];
  }

  localStorage.setItem(STORAGE_CUSTOM_GAMES, JSON.stringify(updated));

  // Sync to server
  try {
    await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: ADMIN_PASSCODE,
        action: existingIndex >= 0 ? 'edit' : 'add',
        game: newGame,
        id,
        edits: newGame,
      }),
    });
  } catch (e) {
    console.error('Failed to sync game to server:', e);
  }

  return newGame;
}

export function saveCustomGame(game: Omit<Game, 'id'> & { id?: number }): Game {
  saveCustomGameServer(game);
  const current = getCustomGames();
  const id = game.id || Date.now();
  return current.find((g) => g.id === id) || { ...game, id, isCustom: true, freetogame_profile_url: game.game_url };
}

export async function deleteCustomGame(id: number): Promise<void> {
  const current = getCustomGames();
  const filtered = current.filter((g) => g.id !== id);
  localStorage.setItem(STORAGE_CUSTOM_GAMES, JSON.stringify(filtered));

  try {
    await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: ADMIN_PASSCODE,
        action: 'delete',
        id,
      }),
    });
  } catch (e) {
    console.error('Failed to sync deletion to server:', e);
  }
}

// Hide/Delete API Games
export function getDeletedGameIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_GAMES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function markGameAsDeleted(id: number): Promise<void> {
  const current = getDeletedGameIds();
  if (!current.includes(id)) {
    const updated = [...current, id];
    localStorage.setItem(STORAGE_DELETED_GAMES, JSON.stringify(updated));
  }

  try {
    await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: ADMIN_PASSCODE,
        action: 'delete',
        id,
      }),
    });
  } catch (e) {
    console.error('Failed to sync mark deletion to server:', e);
  }
}

export async function restoreDeletedGame(id: number): Promise<void> {
  const current = getDeletedGameIds();
  const updated = current.filter((item) => item !== id);
  localStorage.setItem(STORAGE_DELETED_GAMES, JSON.stringify(updated));

  try {
    await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: ADMIN_PASSCODE,
        action: 'restore',
        id,
      }),
    });
  } catch (e) {
    console.error('Failed to sync restore to server:', e);
  }
}

// Edited API Games overrides
export function getEditedGames(): Record<number, Partial<Game>> {
  try {
    const raw = localStorage.getItem(STORAGE_EDITED_GAMES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveEditedGame(id: number, edits: Partial<Game>): Promise<void> {
  const current = getEditedGames();
  current[id] = { ...current[id], ...edits };
  localStorage.setItem(STORAGE_EDITED_GAMES, JSON.stringify(current));

  try {
    await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: ADMIN_PASSCODE,
        action: 'edit',
        id,
        edits,
      }),
    });
  } catch (e) {
    console.error('Failed to sync edit to server:', e);
  }
}

// Admin Global Settings
export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SETTINGS);
    const defaults: AdminSettings = {
      customBannerText: '',
      allowDirectBatDownload: true,
      maintenanceMode: false,
      maintenanceTitle: 'ระบบกำลังปิดปรับปรุงชั่วคราว',
      maintenanceMessage: 'GameVault กำลังดำเนินการอัปเกรดเซิร์ฟเวอร์และระบบความปลอดภัย ขออภัยในความไม่สะดวก กรุณากลับมาใหม่อีกครั้งในภายหลัง',
      maintenanceEstimatedTime: 'คาดว่าจะเปิดให้บริการเร็วๆ นี้',
      installerSignature: 'GameVault Executive Engine v3.7',
    };
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return {
      customBannerText: '',
      allowDirectBatDownload: true,
      maintenanceMode: false,
      maintenanceTitle: 'ระบบกำลังปิดปรับปรุงชั่วคราว',
      maintenanceMessage: 'GameVault กำลังดำเนินการอัปเกรดเซิร์ฟเวอร์และระบบความปลอดภัย ขออภัยในความไม่สะดวก กรุณากลับมาใหม่อีกครั้งในภายหลัง',
      maintenanceEstimatedTime: 'คาดว่าจะเปิดให้บริการเร็วๆ นี้',
      installerSignature: 'GameVault Executive Engine v3.7',
    };
  }
}

export async function saveAdminSettings(settings: AdminSettings): Promise<void> {
  localStorage.setItem(STORAGE_ADMIN_SETTINGS, JSON.stringify(settings));

  try {
    // Sync maintenance
    await syncMaintenanceMode(
      settings.maintenanceMode,
      settings.maintenanceTitle,
      settings.maintenanceMessage,
      settings.maintenanceEstimatedTime
    );

    // Sync banner
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: ADMIN_PASSCODE,
        customBannerText: settings.customBannerText,
      }),
    });
  } catch (e) {
    console.error('Failed to sync settings to server:', e);
  }
}

// Backup & Restore
export function exportBackupData(): string {
  const data = {
    customGames: getCustomGames(),
    deletedGameIds: getDeletedGameIds(),
    editedGames: getEditedGames(),
    settings: getAdminSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.customGames) localStorage.setItem(STORAGE_CUSTOM_GAMES, JSON.stringify(data.customGames));
    if (data.deletedGameIds) localStorage.setItem(STORAGE_DELETED_GAMES, JSON.stringify(data.deletedGameIds));
    if (data.editedGames) localStorage.setItem(STORAGE_EDITED_GAMES, JSON.stringify(data.editedGames));
    if (data.settings) localStorage.setItem(STORAGE_ADMIN_SETTINGS, JSON.stringify(data.settings));
    return true;
  } catch {
    return false;
  }
}

export async function resetAllAdminOverrides(): Promise<void> {
  localStorage.removeItem(STORAGE_CUSTOM_GAMES);
  localStorage.removeItem(STORAGE_DELETED_GAMES);
  localStorage.removeItem(STORAGE_EDITED_GAMES);

  try {
    await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: ADMIN_PASSCODE }),
    });
  } catch (e) {
    console.error('Failed to reset on server:', e);
  }
}
