import { z } from "zod";

export const UtilityType = z.enum(["smoke", "flash", "molotov", "he"]);
export const Side = z.enum(["t", "ct"]);
export const PracticeState = z.enum(["new", "learning", "solid", "mastered"]);

export const ThrowTechnique = z.enum([
  "left_click",
  "right_click",
  "jumpthrow",
  "runthrow",
  "walkthrow",
]);

export const LineupSchema = z.object({
  id: z.string(),
  name: z.string(),
  map: z.string(),
  side: Side,
  site: z.string(),
  utilityType: UtilityType,

  startPosition: z.string(),
  target: z.string(),
  throwTechnique: ThrowTechnique,

  // optional normalized coordinates [0..1] relative to map image/svg
  startCoords: z.tuple([z.number(), z.number()]).optional(),
  targetCoords: z.tuple([z.number(), z.number()]).optional(),

  crosshairNote: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),

  imageUrls: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),

  favorite: z.boolean().default(false),
  practiceState: PracticeState.default("new"),
  successRating: z.number().min(0).max(5).optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Lineup = z.infer<typeof LineupSchema>;

export const newLineupDefaults = (overrides: Partial<Lineup> = {}): Lineup => {
  const now = new Date().toISOString();
  const base: Lineup = {
    id: overrides.id ?? `${Date.now()}`,
    name: overrides.name ?? "New Lineup",
    map: overrides.map ?? "",
    side: overrides.side ?? "t",
    site: overrides.site ?? "",
    utilityType: overrides.utilityType ?? "smoke",
    startPosition: overrides.startPosition ?? "",
    target: overrides.target ?? "",
    throwTechnique: overrides.throwTechnique ?? "left_click",
      startCoords: overrides.startCoords,
      targetCoords: overrides.targetCoords,
    crosshairNote: overrides.crosshairNote,
    description: overrides.description,
    tags: overrides.tags ?? [],
    imageUrls: overrides.imageUrls ?? [],
    videoUrl: overrides.videoUrl,
    favorite: overrides.favorite ?? false,
    practiceState: overrides.practiceState ?? "new",
    successRating: overrides.successRating,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
  return LineupSchema.parse(base);
};
