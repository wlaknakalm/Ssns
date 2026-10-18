import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'gamevault-db.json');
const ADMIN_PASSCODE = '0852369';

interface ServerState {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceEstimatedTime: string;
  customBannerText: string;
  customGames: any[];
  deletedGameIds: number[];
  editedGames: Record<string, any>;
  downloads: any[];
  updatedAt: number;
}

// Read database from disk
function loadDb(): ServerState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial: ServerState = {
        maintenanceMode: false,
        maintenanceTitle: 'ระบบกำลังปิดปรับปรุงชั่วคราว',
        maintenanceMessage: 'GameVault กำลังดำเนินการอัปเกรดเซิร์ฟเวอร์และระบบความปลอดภัย ขออภัยในความไม่สะดวก กรุณากลับมาใหม่อีกครั้งในภายหลัง',
        maintenanceEstimatedTime: 'คาดว่าจะเปิดให้บริการเร็วๆ นี้',
        customBannerText: '',
        customGames: [],
        deletedGameIds: [],
        editedGames: {},
        downloads: [],
        updatedAt: Date.now(),
      };
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading db:', err);
    return {
      maintenanceMode: false,
      maintenanceTitle: 'ระบบกำลังปิดปรับปรุงชั่วคราว',
      maintenanceMessage: 'GameVault กำลังดำเนินการอัปเกรดเซิร์ฟเวอร์',
      maintenanceEstimatedTime: 'คาดว่าจะเปิดให้บริการเร็วๆ นี้',
      customBannerText: '',
      customGames: [],
      deletedGameIds: [],
      editedGames: {},
      downloads: [],
      updatedAt: Date.now(),
    };
  }
}

// Save database to disk
function saveDb(state: ServerState) {
  try {
    state.updatedAt = Date.now();
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db:', err);
  }
}

let db = loadDb();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Proxy to FreeToGame to bypass any browser CORS restrictions
  app.get('/api/ftg/games', async (req: Request, res: Response) => {
    try {
      const response = await fetch('https://www.freetogame.com/api/games');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(502).json({ error: 'Failed to fetch upstream games' });
    }
  });

  app.get('/api/ftg/game', async (req: Request, res: Response) => {
    try {
      const id = req.query.id;
      const response = await fetch(`https://www.freetogame.com/api/game?id=${id}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(502).json({ error: 'Failed to fetch upstream game detail' });
    }
  });

  // Public endpoint: returns current shared state for all visitors in real-time
  app.get('/api/public/state', (req: Request, res: Response) => {
    res.json(db);
  });

  // Admin passcode verification
  app.post('/api/admin/verify', (req: Request, res: Response) => {
    const { passcode } = req.body;
    if (passcode === ADMIN_PASSCODE) {
      res.json({ success: true, message: 'Passcode verified' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid passcode' });
    }
  });

  // Admin maintenance mode toggle and messages
  app.post('/api/admin/maintenance', (req: Request, res: Response) => {
    const { passcode, maintenanceMode, maintenanceTitle, maintenanceMessage, maintenanceEstimatedTime } = req.body;
    if (passcode !== ADMIN_PASSCODE) {
      res.status(401).json({ error: 'Unauthorized passcode' });
      return;
    }

    if (typeof maintenanceMode === 'boolean') {
      db.maintenanceMode = maintenanceMode;
    }
    if (maintenanceTitle !== undefined) {
      db.maintenanceTitle = maintenanceTitle;
    }
    if (maintenanceMessage !== undefined) {
      db.maintenanceMessage = maintenanceMessage;
    }
    if (maintenanceEstimatedTime !== undefined) {
      db.maintenanceEstimatedTime = maintenanceEstimatedTime;
    }

    saveDb(db);
    res.json({ success: true, db });
  });

  // Admin custom games & edits management
  app.post('/api/admin/games', (req: Request, res: Response) => {
    const { passcode, action, game, id, edits } = req.body;
    if (passcode !== ADMIN_PASSCODE) {
      res.status(401).json({ error: 'Unauthorized passcode' });
      return;
    }

    if (action === 'add' && game) {
      const newId = game.id || Date.now();
      const customGame = { ...game, id: newId, isCustom: true };
      db.customGames = [customGame, ...db.customGames.filter((g) => g.id !== newId)];
    } else if (action === 'edit' && id && edits) {
      // Check if it's a custom game
      const customIdx = db.customGames.findIndex((g) => g.id === id);
      if (customIdx >= 0) {
        db.customGames[customIdx] = { ...db.customGames[customIdx], ...edits };
      } else {
        db.editedGames[id] = { ...(db.editedGames[id] || {}), ...edits };
      }
    } else if (action === 'delete' && id) {
      db.customGames = db.customGames.filter((g) => g.id !== id);
      if (!db.deletedGameIds.includes(id)) {
        db.deletedGameIds.push(id);
      }
    } else if (action === 'restore' && id) {
      db.deletedGameIds = db.deletedGameIds.filter((item) => item !== id);
    }

    saveDb(db);
    res.json({ success: true, db });
  });

  // Admin announcement banner & signature settings
  app.post('/api/admin/settings', (req: Request, res: Response) => {
    const { passcode, customBannerText } = req.body;
    if (passcode !== ADMIN_PASSCODE) {
      res.status(401).json({ error: 'Unauthorized passcode' });
      return;
    }

    if (customBannerText !== undefined) {
      db.customBannerText = customBannerText;
    }

    saveDb(db);
    res.json({ success: true, db });
  });

  // Admin reset to default
  app.post('/api/admin/reset', (req: Request, res: Response) => {
    const { passcode } = req.body;
    if (passcode !== ADMIN_PASSCODE) {
      res.status(401).json({ error: 'Unauthorized passcode' });
      return;
    }

    db.customGames = [];
    db.deletedGameIds = [];
    db.editedGames = {};
    saveDb(db);
    res.json({ success: true, db });
  });

  // Record download globally
  app.post('/api/downloads/record', (req: Request, res: Response) => {
    const { item } = req.body;
    if (item && item.gameTitle) {
      db.downloads = [item, ...db.downloads.filter((d) => d.id !== item.id)].slice(0, 100);
      saveDb(db);
    }
    res.json({ success: true });
  });

  // Vite Integration: Dev vs Production
  if (process.env.NODE_ENV === 'production' || process.env.RUN_PROD === 'true') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GameVault Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
