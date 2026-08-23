# MyRoom — Interactive 2.5D Portfolio

A stylized room built from independent transparent WebP assets, layered with CSS 3D transforms into a fullscreen parallax scene. Move the mouse to rotate the room a few degrees — near objects sweep faster than far ones. No 3D library, just CSS 3D + one `requestAnimationFrame` loop. Click any interactive object to open a glassmorphism panel with portfolio content.

**Live:** Deployed on Vercel (or any static host) — works from any sub-path thanks to `base: './'`.

---

## Quick Start

```bash
cd Not-An-Image
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to ./dist
npm run preview  # preview the build
```

---

## Project Structure

```
Not-An-Image/
├─ public/
│  ├─ assets/                 # 22 transparent WebP assets (never flattened)
│  │  ├─ window.webp  corkboard.webp  clock.webp  frames.webp   # wall
│  │  ├─ bookshelf.webp  floorplant.webp  guitar.webp           # floor
│  │  ├─ person.webp  cat.webp  table.webp                      # desk group
│  │  ├─ plant.webp  books.webp  lamp.webp  coffee.webp
│  │  ├─ laptop.webp  usb.webp  pencils.webp  phone.webp  headphones.webp  # desk props
│  │  ├─ focus-loop.wav       # lo-fi audio loop (royalty-free)
│  │  └─ Me/                  # character variants for gallery
│  ├─ content.json            # editable panel content (loaded at runtime)
│  ├─ certifications.json     # GitHub-hosted certifications list
│  ├─ Karthikeyan_VR_Resume_DS.pdf
│  └─ logo.png
├─ src/
│  ├─ jsx/
│  │  ├─ App.jsx              # mounts HeroScene, logs selections
│  │  ├─ HeroScene.jsx        # main scene: room shell + layers + panels
│  │  └─ main.jsx             # entry point
│  ├─ js/
│  │  ├─ sceneLayout.js       # THE layout map — positions, depth, sections
│  │  ├─ useParallaxRig.js    # camera: perspective, pointer-eased rotation
│  │  ├─ useAlphaHover.js     # pixel-accurate hover via offscreen canvas
│  │  └─ assetUrl.js          # BASE_URL helper for sub-path deploys
│  └─ css/
│     ├─ HeroScene.css        # room shell, parallax planes, glass panels, hover label
│     └─ index.css            # global reset
├─ index.html
├─ vite.config.js             # base: './' for sub-path support
├─ vercel.json                # SPA rewrites + static build
└─ package.json
```

---

## How the Scene Works

The page **is** the room. `.hero` fills the viewport. `.hero__scene` is a box locked to **16 / 10** aspect ratio, scaled with `object-fit: contain` logic — the artwork is never cropped or stretched. On wider/taller viewports the CSS room shell (wall & floor gradients) extends past the room box so every screen is fully "inside the room."

### The 3D Rig

```
.hero__parallax   perspective camera, P = 1000 design units in front of z = 0
.hero__room       preserve-3d container — rotated toward pointer (≤ 2.8° yaw / 1.6° pitch)
.depth            one 3D plane per object at its `depth` z position
```

Each `.depth` plane uses `translateZ(depth) scale((P-depth)/P)` with `transform-origin` pinned at the stage center. This **exactly cancels perspective scaling**: at rest the room is pixel-identical to the flat artwork. Only camera movement reveals depth. The CSS wall/floor shell sits behind every plane, so no plane ever uncovers a hole behind its neighbours while rotating.

### Asset Layout (`sceneLayout.js`)

Every asset is an absolutely positioned `<img>` inside its depth plane, defined by:

| Field | Meaning |
|-------|---------|
| `left` | Distance from stage left edge, % of stage **width** |
| `bottom` | Object's **contact line** (floor, tabletop, frame bottom), % of stage **height** |
| `width` | Object width % of stage width; height follows PNG aspect ratio |
| `flip` | Mirror horizontally (`scaleX(-1)`) |
| `zIndex` | Paint order in flat view (kept for occlusion contract) |
| `depth` | Z position in design units: `0` = artwork plane, negative = farther, positive = closer. Drives parallax. |
| `section` | Portfolio destination — presence makes the layer interactive |

**Design grid:** 1600 × 1000 px, wall/floor line at y = 620 (62%).

### Depth Ordering (back → front)

| z | Layer | depth | section |
|---|-------|-------|---------|
| 0–1 | wall + floor (CSS shell) | -430 | — |
| 2 | window (set into wall) | -430 | — |
| 3 | corkboard | -350 | Certificates |
| 4 | clock | -350 | Timeline |
| 5 | frames | -350 | Gallery |
| 6 | baseboard + lamp light (CSS) | -430 | — |
| 8 | bookshelf | -360 | Skills & Stack |
| 9 | floor plant | -380 | — |
| 10 | guitar | -360 | Hobbies |
| 12 | person + chair | -40 | About Me |
| 13 | cat (front of chair, behind desk legs) | 10 | Meet the Cat |
| 14 | **table** | 28 | — (scenery) |
| 15 | desk plant | 52 | — |
| 16 | pencil cup | 76 | Sketches |
| 17 | books | 100 | Reading List |
| 18 | phone | 116 | Contact |
| 19 | usb drive | 130 | Resume |
| 20 | lamp (mirrored) | 148 | Ideas & Blog |
| 21 | coffee | 164 | Fun Facts |
| 22 | laptop | 180 | Projects |
| 23 | headphones | 196 | Music & Focus |

Desk props step forward across the tabletop: the deeper an object's contact line sits on the desk, the farther it is from the camera — at rest the composition is identical, and when the room rotates the laptop sweeps more than the plant, the plant more than the wall art.

---

## Hover + Click

* `useAlphaHover.js` reads each **interactive** asset's alpha channel once into a small (220px-wide) grid. One `pointermove` listener on the stage walks interactive layers front-to-back and returns the first whose *opaque* pixels are under the cursor — transparent corners never steal hover, mirrored layers have x flipped before sampling. Scenery (table, floor, window, plants) is skipped entirely.
* Hovered layer gets a **white contour**: `drop-shadow` passes for a dense, gap-free edge + subtle glow + `brightness(1.12)`.
* A small pill label shows the section name above the hovered object.
* Clicking fires `onSelect(id, section)` on `<HeroScene />` — that's the hook for wiring portfolio sections. `App.jsx` logs it and opens a glassmorphism panel.
* The offscreen canvas is used **only** to read alpha — the scene itself is pure DOM + CSS 3D transforms, nothing is rendered to canvas.

---

## Glassmorphism Panels

Click an interactive object → a full-viewport glass panel slides in with that section's content. Panels are defined in `src/jsx/HeroScene.jsx` (`FALLBACK_CONTENT.panels`) and merged at runtime with `public/content.json` so you can edit copy without touching code.

**Panel types:** About Me, Certificates (from `certifications.json`), Timeline, Gallery, Skills & Stack, Projects, Resume (PDF download), Contact, Meet the Cat, Hobbies, Ideas & Blog, Sketches, Reading List, Fun Facts, Coffee Break, Music & Focus (with lo-fi audio player).

---

## Parallax Tuning

All in two files:

* **`sceneLayout.js`** — `depth` per object, `PERSPECTIVE` (1000), `SHELL_DEPTH` (-430). Bigger `PERSPECTIVE` = gentler perspective; wider spread of `depth` values = stronger near/far separation.
* **`useParallaxRig.js`** — `RY_MAX` / `RX_MAX` (max camera swing in degrees), `EASE` (smoothing), `MIN_STRENGTH` (mobile floor). Intensity scales down on small screens, disabled for `prefers-reduced-motion`; on touch the room eases back to rest when finger lifts.

The loop writes a single `transform` on `.hero__room` per frame — no React state, no re-renders, GPU-composited.

---

## Content Editing

| File | What it controls |
|------|------------------|
| `public/content.json` | All panel copy (merge strategy: JSON overrides fallback) |
| `public/certifications.json` | Certificate list for Corkboard panel |
| `src/jsx/HeroScene.jsx` | `FALLBACK_CONTENT.panels` — fallback when JSON fails to load |

Add a new section:
1. Add a layer to `LAYERS` in `sceneLayout.js` with a `section` string.
2. Add a panel entry to `FALLBACK_CONTENT.panels` (and optionally `content.json`).
3. The panel renders automatically via `GlassPanel` — no new components needed.

---

## Deploy

### Vercel (zero-config)
Push to GitHub → Import in Vercel → `vercel.json` handles SPA rewrites + static build.

### GitHub Pages
```bash
npm run build
# deploy ./dist to gh-pages branch
```
`vite.config.js` uses `base: './'` so the build works from any sub-path (`/repo/`, `/docs/`, etc.).

### Any Static Host
`npm run build` outputs to `./dist` — upload anywhere.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `./dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint on `src` |
| `npm run format` | Prettier on `src` |
| `npm run typecheck` | TypeScript no-emit check |

---

## Tech Stack

* **React 18** + **Vite 5**
* **CSS 3D Transforms** — no Three.js, no canvas rendering
* **Vanilla JS hooks** — `useParallaxRig`, `useAlphaHover`
* **Glassmorphism panels** — CSS backdrop-filter + custom properties
* **Vercel-ready** — static build + SPA rewrites

---

## Accessibility

* Keyboard navigation: `Tab` to focus interactive layers, `Enter`/`Space` to open panel
* `prefers-reduced-motion` disables parallax rotation
* Semantic roles (`role="button"`, `aria-label`) on interactive layers
* Live region for clock (`aria-live="polite"`)
* All images have descriptive `alt` text

---

## License

MIT — do whatever you want.