# Copilot Instructions

You are helping build a **web-first CS2 lineup app** that may later be wrapped in **Tauri** for desktop.  
The app should be designed so it can be deployed as a normal web app first, while staying easy to package for desktop later.

## Product goal

Build a **personal CS2 nade lineup library** focused on **fast retrieval and practice**, not social features.

The app should let the user:
- save lineups
- browse by map
- filter by utility type, side, and site
- search quickly
- open a lineup detail page
- mark favorites
- track practice/learning state
- add image URLs and video URLs
- work fully client-side in V1

## Core principles

- **Web first**
  - Build as a standard React app
  - Avoid desktop-only assumptions in core app logic
  - Keep the app easy to host as a normal site

- **Desktop ready**
  - Structure code so it can later be wrapped with Tauri
  - Keep native/platform-specific logic isolated behind adapters
  - Do not couple UI directly to browser-only or Tauri-only APIs

- **Small, useful V1**
  - Prioritize a shippable personal tool
  - Do not overbuild
  - Retrieval speed matters more than flashy visuals

- **Local-first**
  - Prefer client-side persistence for V1
  - Avoid requiring a backend unless clearly necessary
  - Support import/export for backup later

## Tech preferences

Preferred stack:
- React
- TypeScript
- Vite
- React Router
- Zustand
- Zustand persist middleware
- Zod
- Mantine

Persistence choice for V1:
- Zustand store with persist middleware
- localStorage as the persistence layer

You may suggest lightweight alternatives, but do not introduce unnecessary complexity.

## V1 scope

### Must have
- create, edit, delete lineups
- local persistence
- search
- filters
- favorites
- practice status
- responsive layout
- image URL support
- video URL support

### Nice to have
- import/export JSON
- pinned or “must know” lineups
- keyboard shortcuts
- practice queue

### Explicitly out of scope for V1
- auth
- team collaboration
- comments
- strat builder
- cloud sync
- backend database
- advanced media processing
- map click overlays

Do not add out-of-scope features unless explicitly asked.

## UX guidance

### The app should feel:
- fast
- clean
- practical
- easy to use during practice

### Priorities:
1. fast search
2. clear filtering
3. simple add/edit flow
4. readable lineup cards
5. minimal friction

### Avoid:
- overly dense tables for core browsing
- unnecessary animations
- overly clever abstractions
- enterprise-style architecture

## Main screens

Implement around these pages:

- Dashboard
  - recent lineups
  - favorites
  - needs practice
  - quick links to maps

- Maps page
  - map cards or map list

- Map detail page
  - filters
  - search
  - lineup cards

- Lineup detail page
  - full lineup info
  - media
  - notes
  - practice state

- New/Edit lineup page
  - simple form

- Practice page
  - random or filtered lineup review
  - mark learned / shaky / missed

- Settings page
  - basic app settings only if needed

## Routing

Use a simple route structure like:

- `/`
- `/maps`
- `/maps/:mapId`
- `/lineups/new`
- `/lineups/:lineupId`
- `/lineups/:lineupId/edit`
- `/practice`
- `/settings`

Keep routes simple and predictable.

## Domain model

Use a lineup model close to this shape:

```ts
export type UtilityType = "smoke" | "flash" | "molotov" | "he";
export type Side = "t" | "ct";
export type PracticeState = "new" | "learning" | "solid" | "mastered";

export interface Lineup {
  id: string;
  name: string;
  map: string;
  side: Side;
  site: string;
  utilityType: UtilityType;

  startPosition: string;
  target: string;
  throwTechnique:
    | "left_click"
    | "right_click"
    | "jumpthrow"
    | "runthrow"
    | "walkthrow";

  crosshairNote?: string;
  description?: string;
  tags: string[];

  imageUrls: string[];
  videoUrl?: string;

  favorite: boolean;
  practiceState: PracticeState;
  successRating?: number;

  createdAt: string;
  updatedAt: string;
}