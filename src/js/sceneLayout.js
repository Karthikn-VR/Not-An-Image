/**
 * Hero room layout map.
 *
 * `src` is relative on purpose: HeroScene prefixes it with import.meta.env.BASE_URL,
 * so the scene works at "/" locally and at "/<repo>/" on GitHub Pages.
 *
 * Every layer is an independent transparent PNG - nothing is flattened.
 * Coordinates are percentages of the scene box, which is locked to a 16 / 10
 * aspect ratio, so the whole room scales as one unit.
 *
 * Design grid used to derive the numbers below: 1600 x 1000 px,
 * with the wall / floor line at y = 620 (62%).
 *
 *   left    -> distance from the left edge of the scene (%)
 *   bottom  -> the object's "contact line" (%): where it meets the floor,
 *              the tabletop, or (for wall art) the bottom of the frame.
 *              Anchoring by the contact point keeps everything planted.
 *   width   -> width of the object (%); height follows the PNG aspect ratio.
 *   flip    -> mirror the asset horizontally (scaleX(-1))
 *   zIndex  -> explicit depth order (paint order in the flat view)
 *   depth   -> the object's Z position in design units (see below)
 *   section -> portfolio destination. Layers WITH a section are interactive
 *              (white hover outline + label). Layers without one are pure
 *              scenery and never light up - that includes the table.
 *
 * Depth (parallax) model
 * ----------------------
 * The stage is a 1600 x 1000 "design grid". Each layer sits on its own
 * full-depth plane at `depth` design units of Z, rendered through a
 * perspective camera (PERSPECTIVE units in front of the z = 0 plane).
 * z = 0 is the plane the flat artwork lived on; negative Z is farther from
 * the camera, positive Z is closer.
 *
 * The values below encode the room's physical layout: wall art is farthest,
 * the wall/floor shell is the back of the room, the chair and desk sit in
 * mid-room, the desk props step forward across the tabletop, and the cat
 * (which sleeps under the desk, in front of the chair) just behind the
 * desk's front edge. The ordering of `depth` matches `zIndex` for every
 * pair of objects that visually overlap, so 3D occlusion agrees with the
 * flat artwork. Objects that do NOT overlap may share a Z (ties fall back
 * to DOM order), which keeps the plane count - and GPU memory - down.
 *
 * Desk geometry (measured from table.png): the tabletop's back edge is at
 * 24.3% and its front edge at 43.7% of the table's own height, and its rear
 * feet land at 75%. The character's chair is planted on that rear foot line,
 * and the desk's back edge crosses him at ~55% of his height, so he reads as
 * sitting behind the desk rather than standing in front of it.
 */

export const SCENE_ASPECT = '16 / 10';
export const SCENE_RATIO = 16 / 10; // same value, used for the padding-box fallback
export const FLOOR_LINE = 62; // % from the top of the stage

// Camera: how far in front of the z = 0 plane the perspective sits, in the
// same design units as `depth`. Bigger = gentler perspective.
export const PERSPECTIVE = 1000;

// The CSS room shell (wall, floor, baseboard, lamp glow) is one single
// full-stage plane at the very back of the room. The glow is merged into
// this plane too: a 40–50 unit Z offset from the wall would drift the glow
// by well under a pixel at the parallax angles we use, so merging it is
// invisible and saves a full-viewport GPU layer.
export const SHELL_DEPTH = -430;

// Back -> front.
export const LAYERS = [
  // ---------- wall ----------
  {
    id: 'window',
    src: 'assets/window.webp',
    alt: 'Window with a night city view',
    left: 7.5,
    bottom: 65.7,
    width: 16.25,
    zIndex: 2,
    depth: SHELL_DEPTH, // set into the back wall: moves with it
    priority: 'high', // part of room shell
  },
  {
    id: 'corkboard',
    src: 'assets/corkboard.webp',
    alt: 'Cork board with pinned notes and photos',
    left: 25.0,
    bottom: 72.5,
    width: 18.75,
    zIndex: 3,
    depth: -350,
    section: 'Certificates',
    priority: 'normal',
  },
  {
    id: 'clock',
    src: 'assets/clock.webp',
    alt: 'Wall clock',
    left: 48.13,
    bottom: 86.4,
    width: 6.56,
    zIndex: 4,
    depth: -350,
    section: 'Timeline',
    priority: 'normal',
  },
  {
    id: 'frames',
    src: 'assets/frames.webp',
    alt: 'Framed collage on the wall',
    left: 67.19,
    bottom: 65.3,
    width: 13.44,
    zIndex: 5,
    depth: -350,
    section: 'Gallery',
    priority: 'normal',
  },

  // ---------- floor ----------
  {
    id: 'bookshelf',
    src: 'assets/bookshelf.webp',
    alt: 'Bookshelf with books, a trophy and a plant',
    left: 81.26, // centered on the original spot, a little bigger
    bottom: 30.0,
    width: 23.5, // was 16.25 - scaled up, feet stay planted at bottom 30
    zIndex: 8,
    depth: -360, // pulled back near the shell so its feet stay glued to the carpet
    section: 'Skills & Stack',
    shadow: '0 10px 16px rgba(0,0,0,0.35)',
    groundShadow: { left: 50, bottom: -2, width: 88, height: 8, opacity: 0.2 },
    priority: 'normal',
  },
  {
    id: 'floorplant',
    src: 'assets/floorplant.webp',
    alt: 'Tall monstera plant in the corner',
    left: 0.31,
    bottom: 31.0,
    width: 15.63,
    zIndex: 9,
    depth: -380, // farthest of the floor-standing trio, closest to the shell
    shadow: '0 10px 16px rgba(0,0,0,0.3)',
    groundShadow: { left: 50, bottom: -1, width: 74, height: 7, opacity: 0.16 },
    priority: 'normal',
  },
  {
    id: 'guitar',
    src: 'assets/guitar.webp',
    alt: 'Acoustic guitar leaning against the wall',
    left: 15.63,
    bottom: 30.0,
    width: 9.75,
    zIndex: 10,
    depth: -360, // tie with bookshelf (no overlap); DOM order keeps it in front of the plant
    section: 'Hobbies',
    shadow: '0 8px 14px rgba(0,0,0,0.3)',
    groundShadow: { left: 52, bottom: -2, width: 78, height: 8, opacity: 0.18 },
    priority: 'normal',
  },

  // ---------- the desk group ----------
  {
    id: 'person',
    src: 'assets/Me/hellow.webp',
    alt: 'Chibi character sitting in an office chair, waving hello',
    left: 33.38,
    bottom: 18.6, // chair base lands on the desk's rear foot line
    width: 33.25,
    zIndex: 12,
    depth: -40,
    section: 'About Me',
    shadow: '0 14px 18px rgba(0,0,0,0.35)',
    groundShadow: { left: 50, bottom: 1, width: 72, height: 8, opacity: 0.28 },
    priority: 'high',
  },
  {
    id: 'cat',
    src: 'assets/cat.webp',
    alt: 'Sleeping cat under the desk',
    left: 54.38, // moved left and forward: now in front of the chair
    bottom: 6.5,
    width: 15.0,
    zIndex: 13, // in front of the chair, still behind the desk legs
    depth: 10,
    section: 'Meet the Cat',
    shadow: '0 6px 10px rgba(0,0,0,0.5)',
    groundShadow: { left: 52, bottom: 4, width: 74, height: 11, opacity: 0.26 },
    priority: 'normal',
  },
  {
    id: 'table',
    src: 'assets/table.webp',
    alt: 'Wooden desk',
    left: 21.88,
    bottom: 4.0,
    width: 56.25,
    zIndex: 14,
    depth: 28,
    shadow: '0 12px 16px rgba(0,0,0,0.45)',
    groundShadow: { left: 50, bottom: 0, width: 92, height: 9, opacity: 0.34 },
    // scenery on purpose: no hover outline on the desk
    priority: 'high',
  },

  // ---------- on the desk (ordered by depth: deepest first) ----------
  // Items step forward across the tabletop: the deeper an object sits on
  // the desk (higher `bottom`), the farther it is from the camera.
  {
    id: 'plant',
    src: 'assets/plant.webp',
    alt: 'Small potted plant on the desk',
    left: 36.25, // moved right, tucked in behind the laptop's left edge
    bottom: 46.5,
    width: 4.375,
    zIndex: 15,
    depth: 52,
    shadow: '0 3px 5px rgba(0,0,0,0.4)',
    priority: 'normal',
  },
  {
    id: 'books',
    src: 'assets/books.webp',
    alt: 'Stack of programming books',
    left: 63.75,
    bottom: 45.5,
    width: 10.31, // longer stack
    zIndex: 17,
    depth: 100,
    section: 'Reading List',
    shadow: '0 3px 5px rgba(0,0,0,0.4)',
    priority: 'normal',
  },
  {
    id: 'lamp',
    src: 'assets/lamp.webp',
    alt: 'Desk lamp',
    left: 23.5,
    bottom: 42.9,
    width: 13.31,
    zIndex: 20,
    flip: true, // mirrored: the shade points right, at the laptop
    depth: 148,
    section: 'Ideas & Blog',
    shadow: '0 5px 7px rgba(0,0,0,0.4)',
    priority: 'normal',
  },
  {
    id: 'coffee',
    src: 'assets/coffee.webp',
    alt: 'Mug of coffee',
    left: 65.0, // bigger and pushed deeper into the desk
    bottom: 41.5,
    width: 7.81,
    zIndex: 21,
    depth: 164,
    section: 'Fun Facts',
    shadow: '0 3px 5px rgba(0,0,0,0.45)',
    priority: 'normal',
  },
  {
    id: 'laptop',
    src: 'assets/laptop.webp',
    alt: 'Laptop covered in stickers',
    left: 38.98,
    bottom: 40.4,
    width: 22.03,
    zIndex: 22,
    depth: 180,
    section: 'Projects',
    shadow: '0 5px 7px rgba(0,0,0,0.45)',
    priority: 'high',
  },
  {
    id: 'usb',
    src: 'assets/usb.webp',
    alt: 'USB flash drive on the desk',
    left: 35.0, // pushed deep: mid-desk, left of the laptop
    bottom: 43.2,
    width: 3.25,
    zIndex: 19,
    depth: 130,
    section: 'Resume',
    shadow: '0 2px 4px rgba(0,0,0,0.5)',
    priority: 'normal',
  },
  {
    id: 'pencils',
    src: 'assets/pencils.webp',
    alt: 'Cup of pencils and pens',
    left: 31.25, // deep, moved right towards the laptop, clear of the lamp
    bottom: 44.8,
    width: 4.375,
    zIndex: 16,
    depth: 76,
    section: 'Sketches',
    shadow: '0 3px 5px rgba(0,0,0,0.45)',
    priority: 'normal',
  },
  {
    id: 'phone',
    src: 'assets/phone.webp',
    alt: 'Smartphone in a stand',
    left: 61.25, // pushed deep: sits back, just right of the laptop
    bottom: 43.4,
    width: 3.75,
    zIndex: 18,
    depth: 116,
    section: 'Contact',
    shadow: '0 3px 5px rgba(0,0,0,0.5)',
    priority: 'normal',
  },
  {
    id: 'headphones',
    src: 'assets/headphones.webp',
    alt: 'Headphones on the desk',
    left: 70.31,
    bottom: 37.5,
    width: 7.5,
    zIndex: 23,
    depth: 196, // closest object to the camera in the room
    section: 'Music & Focus',
    shadow: '0 3px 5px rgba(0,0,0,0.45)',
    priority: 'normal',
  },
];

/**
 * Hover glow for interactive layers.
 *
 * A thin 1px white contour (single sharp drop-shadow) plus a soft outer
 * glow and brightness bump.  Only ONE drop-shadow pass is used so it
 * stays clean inside the preserve-3d compositing pipeline.
 */
export const HOVER_OUTLINE =
  'drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 0 5px rgba(255,255,255,0.45)) brightness(1.12)';
