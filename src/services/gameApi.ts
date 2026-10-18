import { Game, GameDetail } from '../types';

// Curated high-quality fallback dataset in case of network interruption or API rate limits
export const FALLBACK_GAMES: Game[] = [
  {
    id: 540,
    title: "Overwatch 2",
    thumbnail: "https://www.freetogame.com/g/540/thumbnail.jpg",
    short_description: "A hero-focused first-person team shooter from Blizzard Entertainment.",
    game_url: "https://www.freetogame.com/open/overwatch",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Activision Blizzard",
    developer: "Blizzard Entertainment",
    release_date: "2022-10-04",
    freetogame_profile_url: "https://www.freetogame.com/overwatch"
  },
  {
    id: 516,
    title: "PUBG: BATTLEGROUNDS",
    thumbnail: "https://www.freetogame.com/g/516/thumbnail.jpg",
    short_description: "Get into the action in one of the longest running Battle Royale games PUBG.",
    game_url: "https://www.freetogame.com/open/pubg",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "KRAFTON",
    developer: "PUBG Studios",
    release_date: "2022-01-12",
    freetogame_profile_url: "https://www.freetogame.com/pubg"
  },
  {
    id: 523,
    title: "Fall Guys",
    thumbnail: "https://www.freetogame.com/g/523/thumbnail.jpg",
    short_description: "Play the most competitive MMO party royale where you battle through rounds of chaos.",
    game_url: "https://www.freetogame.com/open/fall-guys",
    genre: "Battle Royale",
    platform: "PC (Windows)",
    publisher: "Mediatonic",
    developer: "Mediatonic",
    release_date: "2020-08-04",
    freetogame_profile_url: "https://www.freetogame.com/fall-guys"
  },
  {
    id: 452,
    title: "Call of Duty: Warzone",
    thumbnail: "https://www.freetogame.com/g/452/thumbnail.jpg",
    short_description: "A standalone free-to-play battle royale and shooter game set in Modern Warfare universe.",
    game_url: "https://www.freetogame.com/open/call-of-duty-warzone",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Activision",
    developer: "Infinity Ward",
    release_date: "2020-03-10",
    freetogame_profile_url: "https://www.freetogame.com/call-of-duty-warzone"
  },
  {
    id: 21,
    title: "Destiny 2",
    thumbnail: "https://www.freetogame.com/g/21/thumbnail.jpg",
    short_description: "A free-to-play multiplayer first-person shooter with rich sci-fi lore.",
    game_url: "https://www.freetogame.com/open/destiny-2",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Bungie",
    developer: "Bungie",
    release_date: "2019-10-01",
    freetogame_profile_url: "https://www.freetogame.com/destiny-2"
  },
  {
    id: 345,
    title: "Forge of Empires",
    thumbnail: "https://www.freetogame.com/g/345/thumbnail.jpg",
    short_description: "A 2D city-building browser strategy game developed by InnoGames.",
    game_url: "https://www.freetogame.com/open/forge-of-empires",
    genre: "Strategy",
    platform: "Web Browser",
    publisher: "InnoGames",
    developer: "InnoGames",
    release_date: "2012-04-17",
    freetogame_profile_url: "https://www.freetogame.com/forge-of-empires"
  },
  {
    id: 11,
    title: "Naraka: Bladepoint",
    thumbnail: "https://www.freetogame.com/g/11/thumbnail.jpg",
    short_description: "An action-packed 60-player melee-focused battle royale with mystical martial arts.",
    game_url: "https://www.freetogame.com/open/naraka-bladepoint",
    genre: "Battle Royale",
    platform: "PC (Windows)",
    publisher: "NetEase Games",
    developer: "24 Entertainment",
    release_date: "2021-08-12",
    freetogame_profile_url: "https://www.freetogame.com/naraka-bladepoint"
  },
  {
    id: 475,
    title: "Genshin Impact",
    thumbnail: "https://www.freetogame.com/g/475/thumbnail.jpg",
    short_description: "If you've been looking for a game to scratch that Breath of the Wild itch, this is it.",
    game_url: "https://www.freetogame.com/open/genshin-impact",
    genre: "Action RPG",
    platform: "PC (Windows)",
    publisher: "miHoYo",
    developer: "miHoYo",
    release_date: "2020-09-28",
    freetogame_profile_url: "https://www.freetogame.com/genshin-impact"
  },
  {
    id: 57,
    title: "Fortnite",
    thumbnail: "https://www.freetogame.com/g/57/thumbnail.jpg",
    short_description: "A 100-player battle royale shooter that took the gaming world by storm.",
    game_url: "https://www.freetogame.com/open/fortnite-battle-royale",
    genre: "Battle Royale",
    platform: "PC (Windows)",
    publisher: "Epic Games",
    developer: "Epic Games",
    release_date: "2017-09-26",
    freetogame_profile_url: "https://www.freetogame.com/fortnite-battle-royale"
  },
  {
    id: 340,
    title: "Game of Thrones Winter is Coming",
    thumbnail: "https://www.freetogame.com/g/340/thumbnail.jpg",
    short_description: "A free-to-play 3D browser real-time strategy based on the epic TV series.",
    game_url: "https://www.freetogame.com/open/game-of-thrones-winter-is-coming",
    genre: "Strategy",
    platform: "Web Browser",
    publisher: "GTArcade",
    developer: "YOOZOO Games",
    release_date: "2019-03-26",
    freetogame_profile_url: "https://www.freetogame.com/game-of-thrones-winter-is-coming"
  },
  {
    id: 515,
    title: "Halo Infinite",
    thumbnail: "https://www.freetogame.com/g/515/thumbnail.jpg",
    short_description: "The Master Chief returns in the legendary sci-fi shooter series with free multiplayer.",
    game_url: "https://www.freetogame.com/open/halo-infinite",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Xbox Game Studios",
    developer: "343 Industries",
    release_date: "2021-11-15",
    freetogame_profile_url: "https://www.freetogame.com/halo-infinite"
  },
  {
    id: 4,
    title: "Apex Legends",
    thumbnail: "https://www.freetogame.com/g/4/thumbnail.jpg",
    short_description: "Master an expanding roster of diverse legends with powerful abilities in this fast-paced battle royale.",
    game_url: "https://www.freetogame.com/open/apex-legends",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Electronic Arts",
    developer: "Respawn Entertainment",
    release_date: "2019-02-04",
    freetogame_profile_url: "https://www.freetogame.com/apex-legends"
  }
];

export interface FetchResult {
  games: Game[];
  latency: number;
  isRealApi: boolean;
  source: string;
}

// Fetch all games from live FreeToGame API
export async function getRealGames(): Promise<FetchResult> {
  const startTime = performance.now();
  
  // Strategy 1: Direct API call (works when CORS is enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://www.freetogame.com/api/games', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const latency = Math.round(performance.now() - startTime);
        return {
          games: data,
          latency,
          isRealApi: true,
          source: 'FreeToGame Official Live API'
        };
      }
    }
  } catch {
    // If direct fetch fails (e.g. CORS or adblocker), try strategy 2
  }

  // Strategy 2: Proxy via local dev endpoint /api/ftg/games
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/ftg/games', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const latency = Math.round(performance.now() - startTime);
        return {
          games: data,
          latency,
          isRealApi: true,
          source: 'FreeToGame Proxy Gateway'
        };
      }
    }
  } catch {
    // Proxy not available
  }

  // Strategy 3: Public reliable CORS mirror
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://corsproxy.io/?url=' + encodeURIComponent('https://www.freetogame.com/api/games'), {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const latency = Math.round(performance.now() - startTime);
        return {
          games: data,
          latency,
          isRealApi: true,
          source: 'FreeToGame Mirror Network'
        };
      }
    }
  } catch {
    // Mirror failed
  }

  // Fallback to high quality preloaded data
  const latency = Math.round(performance.now() - startTime);
  return {
    games: FALLBACK_GAMES,
    latency,
    isRealApi: false,
    source: 'GameVault Offline Cache (Resilience Mode)'
  };
}

// Fetch single game details
export async function getGameDetail(id: number): Promise<GameDetail | null> {
  // Strategy 1: Direct
  try {
    const res = await fetch(`https://www.freetogame.com/api/game?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch {
    // Ignore
  }

  // Strategy 2: Local proxy
  try {
    const res = await fetch(`/api/ftg/game?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch {
    // Ignore
  }

  // Strategy 3: Mirror proxy
  try {
    const res = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(`https://www.freetogame.com/api/game?id=${id}`));
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch {
    // Ignore
  }

  return null;
}
