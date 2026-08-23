# Hero room scene

React + Vite. **Hero section only** — no navbar, routing, other portfolio sections.
The scene is a stylized room built from independent transparent PNGs layered with CSS —
rendered as a **fullscreen 2.5D parallax room**: a perspective camera sits in front of
the original artwork plane and every object lives on its own depth plane, so moving the
mouse rotates the room a few degrees and near/far objects sweep at different speeds.
No 3D library — it's CSS 3D transforms + one `requestAnimationFrame` loop.

## Run

```bash
cd hero-scene
npm install
npm run dev
```

## Structure

```
hero-scene/
├─ public/assets/          # 20 separate transparent PNGs (never flattened)
│  ├─ person.png  table.png  laptop.png  lamp.png  coffee.png      # your uploads
│  ├─ books.png  plant.png                                         # desk decor
│  ├─ window.png  corkboard.png  clock.png  frames.png             # wall
│  ├─ bookshelf.png  floorplant.png  guitar.png  cat.png            # room / floor
│  │                 ^ your uploaded monstera (alpha-trimmed, fringe cleaned)
│  └─ headphones.png  phone.png  pencils.png  usb.png              # desk props
└─ src/components/
   ├─ HeroScene.jsx        # renders the room shell + one <img> per depth plane
   ├─ sceneLayout.js       # THE layout map — positions, depth & sections live here
   ├─ useParallaxRig.js    # the "camera": scale vars + pointer-eased room rotation
   ├─ useAlphaHover.js     # pixel-accurate hover detection
   └─ HeroScene.css        # wall, floor, lamp light, vignette, hover label
```

## How the scene is built

The page IS the room. `.hero` is the full viewport; `.hero__scene` is a box locked to
**16 / 10** that is scaled to **contain** — the artwork is never cropped, stretched, or
letterboxed. On wider/taller aspects the CSS room shell (wall & floor gradients)
extends past the room box to fill the rest of the screen, so every viewport is fully
"inside the room" (wide → more wall on the sides, tall → more wall above, floor below).
`useParallaxRig.js` writes the scale variables on resize so the extension and all
gradient stops re-base exactly — the visible room paints identically at any aspect.

On top of the room box sits the **3D rig**:

```
.hero__parallax   perspective camera, P = 1000 design units in front of the
                  original artwork plane (z = 0), looking at the box center
.hero__room       preserve-3d container — the whole room, rotated toward the
                  pointer (≤ 2.8° yaw / 1.6° pitch, eased exponentially)
.depth            one 3D plane per object at its `depth` z position
```

Each `.depth` plane is `translateZ(depth) scale((P-depth)/P)` scaled **around the stage
center** (pinned per plane in `HeroScene.jsx#placePlane`), which exactly cancels the
perspective scale: at the resting pose the room is **pixel-identical to the flat
artwork** — only the camera movement reveals the depth. That's why no repainting or
inpainting of the assets was needed: the CSS wall/floor shell sits behind every plane,
so a plane never uncovers a hole behind its neighbours while the room rotates.

Every asset is an absolutely positioned `<img>` inside its depth plane, described in
`sceneLayout.js`:

| field | meaning |
|---|---|
| `left` | distance from the stage's left edge, in % of stage **width** |
| `bottom` | the object's **contact line** (floor, tabletop, or bottom of a wall frame), in % of stage **height** |
| `width` | object width in % of stage width; height follows the PNG's aspect ratio |
| `flip` | mirror horizontally (`scaleX(-1)`) |
| `zIndex` | paint order in the flat view (kept for the occlusion contract) |
| `depth` | the object's Z position in design units: `0` = the original artwork plane, negative = farther from the camera, positive = closer. This is what drives the parallax |
| `section` | portfolio destination — presence of this field is what makes a layer interactive |

Design grid behind the numbers: **1600 × 1000 px, wall/floor line at y = 620 (62%)**.
The wall, floor, baseboard, warm lamp light and vignette are CSS only.

### Depth (back → front)

`depth` is the object's Z in design units (the camera sits at z = +1000). It must stay
ordered with `zIndex` for every pair of objects that visually overlap — that's the
contract that keeps 3D occlusion identical to the flat artwork. Objects that don't
overlap may share a `depth` (ties fall back to DOM order).

| z | layer | depth | section |
|---|---|---|---|
| 0–1 | wall + floor (CSS shell plane) | -430 | — |
| 2 | window (set into the wall: moves with it) | -430 | — |
| 3 | corkboard | -350 | Certificates |
| 4 | clock | -350 | Timeline |
| 5 | frames | -350 | Gallery (drop your own photos in later) |
| 6 | baseboard + lamp light (CSS shell plane) | -430 | — |
| 8 | bookshelf | -360 | Skills & Stack |
| 9 | floor plant | -380 | — |
| 10 | guitar | -360 | Hobbies |
| 12 | person + chair | -40 | About Me |
| 13 | cat (in front of the chair, behind the desk legs) | 10 | Meet the Cat |
| 14 | **table** | 28 | — (scenery, never outlines) |
| 15 | desk plant | 52 | — |
| 16 | pencil cup | 76 | Sketches |
| 17 | books | 100 | Reading List |
| 18 | phone | 116 | Contact |
| 19 | usb drive | 130 | Resume |
| 20 | lamp (mirrored) | 148 | Ideas & Blog |
| 21 | coffee | 164 | Fun Facts |
| 22 | laptop | 180 | Projects |
| 23 | headphones | 196 | Music & Focus |
| — | vignette (flat overlay, outside the 3D) | — | — |
| — | hover label (flat overlay) | — | — |

The desk props step forward across the tabletop: the deeper an object's contact line
sits on the desk, the farther it is from the camera — so at rest the composition is the
same, and when the room rotates the laptop sweeps more than the plant, the plant more
than the wall art, and so on.

Depth reads correctly because contact lines follow the room's perspective: the desk's
rear feet sit higher than its front feet, the chair is planted on that rear foot line,
and the desk's back edge crosses the character at ~55% of his height.

## Hover + click

* `useAlphaHover.js` reads each **interactive** asset's alpha channel once into a small
  (220px-wide) grid. One `pointermove` listener on the stage walks interactive layers
  front-to-back and returns the first whose *opaque* pixels are under the cursor — so a
  transparent corner never steals the hover, and mirrored layers get their x flipped
  before sampling. Scenery (table, floor, window, plants) is skipped entirely.
* Hovered layer gets a **white contour**: 8 chained `drop-shadow()` passes (4 axis +
  4 diagonal) for a dense, gap-free edge, a very faint glow, and `brightness(1.05)`.
  Thickness is `--outline: clamp(1.2px, 0.22vw, 3px)` in `HeroScene.css`.
* A small pill label shows the section name above the hovered object.
* Clicking fires `onSelect(id, section)` on `<HeroScene />` — that's the hook for wiring
  real portfolio sections later. Right now `App.jsx` just logs it.
* The offscreen canvas is used **only** to read alpha — the scene itself is pure DOM +
  CSS 3D transforms, nothing is rendered to a canvas.

## Parallax tuning

All of it lives in two files:

* `sceneLayout.js` — the `depth` value per object (see the table above) and
  `PERSPECTIVE` / `SHELL_DEPTH`. Bigger `PERSPECTIVE` = gentler perspective;
  widen the spread of `depth` values = stronger near/far separation.
* `useParallaxRig.js` — `RY_MAX` / `RX_MAX` (max camera swing in degrees), `EASE`
  (smoothing speed), `MIN_STRENGTH` (mobile floor). Intensity is scaled down on
  small screens and disabled entirely for `prefers-reduced-motion`; on touch, the
  room eases back to its resting angle when the finger lifts.

The loop writes a single `transform` on `.hero__room` per frame — no React state,
no re-renders, GPU-composited.

`/scene-reference.jpg` and `/hover-example.jpg` (workspace root) are static renders for
reference — they are **not** used by the app.
