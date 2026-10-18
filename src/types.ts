export interface Game {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
  isCustom?: boolean;
  isFeatured?: boolean;
}

export interface SystemRequirements {
  os?: string;
  processor?: string;
  memory?: string;
  graphics?: string;
  storage?: string;
}

export interface Screenshot {
  id: number;
  image: string;
}

export interface GameDetail extends Game {
  status: string;
  description: string;
  minimum_system_requirements?: SystemRequirements;
  screenshots?: Screenshot[];
}

export type PlatformFilter = 'all' | 'pc' | 'browser';
export type SortOption = 'relevance' | 'newest' | 'az' | 'za';

export interface AdminSettings {
  customBannerText?: string;
  allowDirectBatDownload: boolean;
  maintenanceMode: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  maintenanceEstimatedTime?: string;
  installerSignature: string;
}
