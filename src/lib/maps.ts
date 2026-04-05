export type MapMeta = {
  id: string;
  name: string;
  imageUrl: string; // can be local `public/` path or remote URL
};

export const MAPS: MapMeta[] = [
  {
    id: "de_dust2",
    name: "Dust II",
    imageUrl: "https://via.placeholder.com/1000x600.png?text=de_dust2",
  },
  {
    id: "de_mirage",
    name: "Mirage",
    imageUrl: "https://via.placeholder.com/1000x600.png?text=de_mirage",
  },
  {
    id: "de_inferno",
    name: "Inferno",
    imageUrl: "https://via.placeholder.com/1000x600.png?text=de_inferno",
  },
];

export const getMapImage = (mapId?: string) => MAPS.find((m) => m.id === mapId)?.imageUrl;
