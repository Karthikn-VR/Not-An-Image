import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl } from './assetUrl.js';

/**
 * Pixel-accurate hover detection for overlapping transparent PNGs.
 *
 * The layers are plain <img> elements stacked with z-index, so their bounding
 * boxes overlap heavily (the person's box covers a big slice of the stage).
 * Plain :hover would light up the wrong layer whenever the cursor sits over a
 * transparent corner. Instead each interactive asset's alpha channel is read
 * once into a small lookup grid, and one pointermove listener on the stage
 * walks the layers front-to-back and returns the first whose *opaque* pixels
 * are under the cursor.
 *
 * Only layers with a `section` take part: scenery (the desk, the floor, the
 * window...) is skipped entirely, so it never outlines and never blocks a
 * layer behind it.
 *
 * The canvas here is an offscreen utility for reading alpha only - the scene
 * itself is pure DOM + CSS, nothing is ever rendered to a canvas.
 *
 * Alpha maps are loaded on-demand when a layer's node becomes visible
 * (via IntersectionObserver) to avoid decoding all images upfront.
 */

const SAMPLE_WIDTH = 220; // resolution of the alpha lookup grid
const ALPHA_THRESHOLD = 24; // 0-255; ignore faint anti-aliased edges

function loadAlphaMap(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = Math.min(SAMPLE_WIDTH, img.naturalWidth);
      const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const alpha = new Uint8Array(w * h);
      for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
      resolve({ w, h, alpha });
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function useAlphaHover(layers) {
  const [hovered, setHovered] = useState(null); // { id, section, x, y }
  const maps = useRef(new Map());
  const nodes = useRef(new Map());
  const frame = useRef(0);
  const observers = useRef(new Map());
  const loadingAlpha = useRef(new Set());

  const interactive = layers.filter(layer => layer.section);

  // Load alpha map on demand when layer node is observed
  const loadAlphaMapForLayer = useCallback(layer => {
    if (maps.current.has(layer.id) || loadingAlpha.current.has(layer.id)) return;
    loadingAlpha.current.add(layer.id);
    loadAlphaMap(assetUrl(layer.src))
      .then(map => {
        maps.current.set(layer.id, map);
        loadingAlpha.current.delete(layer.id);
      })
      .catch(() => {
        loadingAlpha.current.delete(layer.id);
      });
  }, []);

  // Set up IntersectionObserver for a layer's node
  const observeNode = useCallback(
    (id, node) => {
      if (!node) return;
      if (observers.current.has(id)) observers.current.get(id).disconnect();

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const layer = layers.find(l => l.id === id);
              if (layer && layer.section) loadAlphaMapForLayer(layer);
            }
          });
        },
        { rootMargin: '100px' } // Start loading a bit before entering viewport
      );
      observer.observe(node);
      observers.current.set(id, observer);
    },
    [layers, loadAlphaMapForLayer]
  );

  // Clean up observers
  useEffect(() => {
    const currentObservers = observers.current;
    return () => {
      currentObservers.forEach(observer => observer.disconnect());
      currentObservers.clear();
    };
  }, []);

  const registerNode = useCallback(
    id => node => {
      if (node) {
        nodes.current.set(id, node);
        // Start observing for alpha map loading
        const layer = layers.find(l => l.id === id);
        if (layer && layer.section) observeNode(id, node);
      } else {
        nodes.current.delete(id);
        if (observers.current.has(id)) {
          observers.current.get(id).disconnect();
          observers.current.delete(id);
        }
      }
    },
    [layers, observeNode]
  );

  // const registerNode = useCallback(
  //   (id) => (node) => {
  //     if (node) nodes.current.set(id, node)
  //     else nodes.current.delete(id)
  //   },
  //   []
  // )

  const pick = useCallback(
    (clientX, clientY) => {
      const ordered = [...interactive].sort((a, b) => b.zIndex - a.zIndex);
      for (const layer of ordered) {
        const node = nodes.current.get(layer.id);
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        )
          continue;

        let u = (clientX - rect.left) / rect.width;
        const v = (clientY - rect.top) / rect.height;
        if (layer.flip) u = 1 - u; // the asset is mirrored on screen

        const map = maps.current.get(layer.id);
        const opaque = map
          ? map.alpha[
              Math.min(map.h - 1, Math.max(0, Math.floor(v * map.h))) * map.w +
                Math.min(map.w - 1, Math.max(0, Math.floor(u * map.w)))
            ] > ALPHA_THRESHOLD
          : true; // alpha not decoded yet: fall back to the bounding box

        if (opaque) {
          // label anchor, in stage-relative pixels
          return {
            id: layer.id,
            section: layer.section,
            x: node.offsetLeft + node.offsetWidth / 2,
            y: node.offsetTop,
          };
        }
      }
      return null;
    },
    [interactive]
  );

  const onPointerMove = useCallback(
    event => {
      const { clientX, clientY } = event;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const next = pick(clientX, clientY);
        setHovered(prev => {
          if (prev?.id === next?.id) return prev;
          return next;
        });
      });
    },
    [pick]
  );

  const onPointerLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    setHovered(null);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return { hovered, registerNode, onPointerMove, onPointerLeave };
}
