# Beit HaMikdash — 3D Virtual Tour

An interactive 3D virtual tour of the Second Holy Temple (Beit HaMikdash) in Jerusalem, built with Three.js.

## Quick Start

This is a static web app — just serve the files with any HTTP server:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .

# Or open directly via VS Code Live Server extension
```

Then open `http://localhost:8000` in your browser.

## Tour Stops

The tour includes 8 interactive stops:

1. **Har HaBayit** — The Temple Mount platform
2. **Ezrat Nashim** — The Women's Court
3. **Sha'ar Nikanor** — The magnificent bronze Nikanor Gate
4. **The Azarah** — The main Temple Courtyard
5. **The Mizbeach** — The great Altar
6. **The Ulam** — The Entrance Hall of the Sanctuary
7. **The Heichal** — The Sanctuary (Menorah, Shulchan, Incense Altar)
8. **Kodesh HaKodashim** — The Holy of Holies

## Controls

- **Left-click drag** — Orbit camera
- **Right-click drag** — Pan view
- **Scroll wheel** — Zoom in/out
- **Click numbered markers** — Jump to tour stop
- **Arrow keys** — Navigate between stops
- **Escape** — Close panels

## Tech Stack

- [Three.js](https://threejs.org/) (v0.162) via CDN
- CSS2DRenderer for 3D-positioned UI markers
- OrbitControls for camera navigation
- Pure HTML/CSS/JS — no build step required
