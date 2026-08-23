import { useEffect, useRef } from 'react';

/**
 * The parallax "camera".
 *
 * The room is a stack of CSS 3D planes (see sceneLayout.js `depth` values).
 * This hook does two jobs:
 *
 *  1. Scale. It measures the stage (the 16:10 room box, which is sized to
 *     *contain* — the room is never cropped) and writes:
 *       --u     pixels per design-grid unit (grid = 1600 x 1000). All 3D
 *               offsets (perspective, translateZ, the pre-compensation
 *               scale) are expressed in design units through --u, so the
 *               room's depth is identical at every screen size.
 *       --ext-x / --ext-y  how far the CSS room shell (wall/floor
 *               gradients) extends past the room box to fill wider or
 *               taller viewports, plus the re-based wall/floor ramp stops.
 *
 *  2. Look. It eases the room's rotation toward the pointer inside one
 *     requestAnimationFrame loop and writes a single `transform` per frame.
 *     No React state is involved, so the animation never triggers a render.
 *
 * Rotation instead of translation on purpose: rotating the diorama around
 * the stage center makes near planes sweep one way and far planes the other
 * (plus a depth-dependent perspective scale), which is what reads as
 * physical depth. The angles are deliberately small (a few degrees) so the
 * room tilts, it never spins.
 */

const RY_MAX = 4.2; // deg — max horizontal camera swing (full pointer span)
const RX_MAX = 2.4; // deg — max vertical camera swing
const EASE = 7; // 1/s — exponential smoothing (time constant ≈ 140 ms)
const MIN_STRENGTH = 0.45; // mobile floor: the effect softens, never vanishes
const GYRO_MAX = 30; // deg - max device tilt for full parallax range

// Idle breathing: a very gentle oscillation so the room feels alive
// even when the user isn't touching the screen.
const IDLE_TIMEOUT = 2500; // ms — how long after last input before idle kicks in
const IDLE_AMP_X = 0.18; // fraction of RY_MAX — horizontal sway amplitude
const IDLE_AMP_Y = 0.12; // fraction of RX_MAX — vertical sway amplitude
const IDLE_SPEED = 0.0004; // rad/ms — oscillation speed (≈ 16 s full cycle)

export default function useParallaxRig() {
  const stageRef = useRef(null); // the 16:10 room box (gets --u, shell ext)
  const roomRef = useRef(null); // the rotating room container

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const hero = stage.parentElement;

    const reduced =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const target = { x: 0, y: 0 }; // pointer, -1..1
    const current = { x: 0, y: 0 }; // eased
    let strength = 1;

    const set = (name, value) => stage.style.setProperty(name, value);

    const update = () => {
      // The room box CONTAINS (min, not max): the artwork is never cropped.
      // Measure the hero (the stage's parent, which is the viewport) rather
      // than relying on 100vw/100vh, which lie on mobile with URL bars.
      const w = hero ? hero.clientWidth : window.innerWidth;
      const h = hero ? hero.clientHeight : window.innerHeight;
      const stageW = Math.min(w, 1.6 * h);
      const stageH = stageW / 1.6;
      const u = stageW / 1600; // px per design unit
      const extX = Math.max(0, (w - stageW) / 2);
      const extY = Math.max(0, (h - stageH) / 2);

      set('--u', u.toFixed(5));
      set('--ext-x', `${extX.toFixed(2)}px`);
      set('--ext-y', `${extY.toFixed(2)}px`);

      // Re-base the wall/floor color ramps to the extended shell boxes so
      // the visible room is painted identically at every aspect ratio.
      // The wall box extends 60u up + extY (height 1060u + extY, its top
      // edge 60u + extY above the room box top); the floor box extends 60u
      // down + extY (height 440u + extY, top edge at the wall/floor seam;
      // the visible floor spans its first 380 units).
      const extYu = extY / u;
      const HW = 1060 + extYu;
      const SW = 60 + extYu;
      set('--wall-s0', `${((SW / HW) * 100).toFixed(3)}%`);
      set('--wall-s45', `${(((SW + 550) / HW) * 100).toFixed(3)}%`);
      set('--wall-s100', `${(((SW + 1000) / HW) * 100).toFixed(3)}%`);
      const HF = 440 + extYu;
      set('--floor-s0', '0%');
      set('--floor-s45', `${((171 / HF) * 100).toFixed(3)}%`);
      set('--floor-s100', `${((380 / HF) * 100).toFixed(3)}%`);

      const still = reduced ? reduced.matches : false;
      strength = still ? 0 : Math.min(1, Math.max(MIN_STRENGTH, w / 1500));
    };
    update();

    const onMove = e => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      lastInputTime = performance.now();
      idleActive = false;
    };
    // Finger lifts: ease back to the resting angle instead of freezing mid-tilt.
    const onUp = e => {
      if (e.pointerType === 'touch') {
        target.x = 0;
        target.y = 0;
        lastInputTime = performance.now();
        idleActive = false;
      }
    };
    // Pointer leaves the window: settle back to the resting angle.
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      lastInputTime = performance.now();
      idleActive = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', update);
    reduced?.addEventListener?.('change', update);
    // mobile URL bar show/hide
    window.visualViewport?.addEventListener?.('resize', update);

    // Gyroscope / DeviceOrientation support for mobile
    const onOrientation = e => {
      // Only use gyro on touch devices and when permission granted (iOS 13+)
      if (
        e.beta !== null &&
        e.gamma !== null &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
      ) {
        // beta: front-to-back tilt (-180 to 180), gamma: left-to-right tilt (-90 to 90)
        // Clamp and normalize to -1..1 range
        target.x = Math.max(-1, Math.min(1, e.gamma / GYRO_MAX));
        target.y = Math.max(-1, Math.min(1, e.beta / GYRO_MAX));
      }
    };

    // iOS 13+ requires permission for DeviceOrientation
    const requestGyroPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', onOrientation, true);
          }
        } catch (err) {
          console.debug('Gyroscope permission denied:', err);
        }
      } else {
        // Non-iOS or older: just add listener
        window.addEventListener('deviceorientation', onOrientation, true);
      }
    };

    // Only request gyro on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      requestGyroPermission();
    }

    let raf = 0;
    let last = performance.now();
    let lastX = null;
    let lastY = null;
    let lastInputTime = performance.now();
    let idleActive = false;

    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp: tab was hidden
      last = now;

      // Idle breathing: after IDLE_TIMEOUT with no input, gently oscillate
      const idleFor = now - lastInputTime;
      if (idleFor > IDLE_TIMEOUT && strength !== 0) {
        if (!idleActive) idleActive = true;
        const t = now * IDLE_SPEED;
        // Lissajous-ish figure so the motion feels organic, not robotic
        target.x = Math.sin(t) * IDLE_AMP_X;
        target.y = Math.sin(t * 0.7 + 1.2) * IDLE_AMP_Y;
      }

      const k = 1 - Math.exp(-dt * EASE);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;

      if (
        strength !== 0 &&
        (lastX === null ||
          Math.abs(current.x - lastX) > 0.0004 ||
          Math.abs(current.y - lastY) > 0.0004)
      ) {
        lastX = current.x;
        lastY = current.y;
        const room = roomRef.current;
        if (room) {
          const ry = (current.x * RY_MAX * strength).toFixed(4);
          const rx = (-current.y * RX_MAX * strength).toFixed(4);
          room.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', update);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      reduced?.removeEventListener?.('change', update);
      window.visualViewport?.removeEventListener?.('resize', update);
      window.removeEventListener('deviceorientation', onOrientation, true);
    };
  }, []);

  return { stageRef, roomRef };
}
