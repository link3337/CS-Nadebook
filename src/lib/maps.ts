export type MapMeta = {
  id: string;
  name: string;
  posterUrl: string; // can be local `public/` path or remote URL
  mapUrl?: string; // optional, used for radar/map images in lineup details
};

export const MAPS: MapMeta[] = [
  {
    id: 'de_dust2',
    name: 'Dust II',
    posterUrl: '/maps/dust2/dust2_poster.webp',
    mapUrl: '/maps/dust2/dust2_game_radar.webp'
  },
  {
    id: 'de_mirage',
    name: 'Mirage',
    posterUrl: '/maps/mirage/mirage_poster.webp',
    mapUrl: '/maps/mirage/mirage_game_radar.webp'
  },
  {
    id: 'de_inferno',
    name: 'Inferno',
    posterUrl: '/maps/inferno/inferno_poster.webp',
    mapUrl: '/maps/inferno/inferno_game_radar.webp'
  }
];

export const getMapPoster = (mapId?: string) => MAPS.find((m) => m.id === mapId)?.posterUrl;
export const getMapImage = (mapId: string) => MAPS.find((m) => m.id === mapId)?.mapUrl;
export const getDisplayMapImage = (mapId?: string) => {
  if (!mapId) return undefined;
  return getMapImage(mapId) ?? getMapPoster(mapId);
};