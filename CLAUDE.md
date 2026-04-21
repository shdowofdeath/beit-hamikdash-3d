# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive 3D virtual tour of the Second Jewish Temple (Beit HaMikdash) built as a static web app using Three.js. No backend, no build step — plain HTML/JS/CSS served directly.

## Running Locally

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

Then open `http://localhost:8000`. No installation or build required.

## Architecture

Everything lives in three files:

- **`js/app.js`** (2,200+ lines) — the entire application: scene setup, all geometry, materials, lighting, animation loop, UI, and tour navigation. Organized into clearly-marked sections with `// ─── SECTION NAME ───` comments.
- **`css/style.css`** — landing screen, info panel, tour markers, modal, responsive layout.
- **`index.html`** — DOM skeleton + Three.js CDN import map (Three.js 0.162 via jsdelivr).

### Coordinate System

- 1 unit ≈ 5 cubits (≈ 2.5 m)
- Axes: X = East–West, Z = North–South, Y = height
- Key Y levels: ground −0.5, temple mount 0, Cheil 0.8, Women's Court 1.5, Azarah 3.0, Ulam 4.4

### Materials

All reusable materials are factory functions on the `MAT` object:

```js
MAT.limestone()  // returns a new MeshStandardMaterial
MAT.gold()
MAT.water()      // MeshPhysicalMaterial with transmission
MAT.fire()       // MeshStandardMaterial, orange emissive
```

Call `MAT.x()` each time (don't share instances) to avoid unintended state sharing.

### Geometry Helpers

- `addBox(parent, geo, mat, x, y, z, shadow)` — generic mesh
- `addStoneWall(parent, sx, sy, sz, px, py, pz, repX, repY)` — textured box using procedural stone material
- `addColumn(parent, mat, x, y, z, radius, height)` — column with capital and base

### Procedural Textures

Stone and floor textures are generated at runtime with a `<canvas>` element during `init()`. They are not image files.

### Tour System

The entire tour is data-driven from the `TOUR_STOPS` array (8 entries). Each stop has:
- `hebrew`, `title`, `body`, `details[]` — UI text
- `camera: {x, y, z}` and `target: {x, y, z}` — eye and look-at positions
- `markerPos: {x, y, z}` — 3D location of the numbered marker dot

To add or adjust a tour stop, edit `TOUR_STOPS`. Camera animation between stops uses cubic-in-out easing with an arc-lift calculated from travel distance.

### Animation Loop

The `animate()` function runs at 60 fps. Objects with `userData.isFlame` are animated via sine/cosine tweens on `performance.now() * 0.001`. Water surface ripples are similarly time-driven.

## Key Sections in app.js

Search for these markers to navigate quickly:

| Section | What it contains |
|---|---|
| `TOUR_STOPS` | Tour data (camera positions, descriptions) |
| `MAT` object | All material factory functions |
| `buildTemple()` | Top-level temple geometry orchestrator |
| `setupLighting()` | All lights + sky shader |
| `animateCamera()` | Smooth camera tween between stops |
| `drawMiniMap()` | Canvas top-down map |
| `animate()` | Main render loop |

## Historical Accuracy Notes

`ACCURACY-REPORT.md` documents intentional simplifications vs. historical sources. Before making structural changes to the temple geometry, consult it to understand which deviations are deliberate.
