// The ground shadow in a hero or plate must fade out before the edges of
// the frame: the app shows the picture on its own background, and a shadow
// that runs out of the frame ends there in a hard straight line. The train
// itself may run out of the frame (it does, on the right).
//
// Renders since the shadow catcher learnt to fade (pipeline/blender/studio.py)
// already pass; earlier ones are faded here, the same way, by publish.

/** The most alpha, out of 255, the shadow may have at the frame's edge: none but the denoiser's noise. */
export const SHADOW_EDGE_ALPHA = 2;
/** How far in from each edge the shadow fades to nothing, in pixels of the 3x render, as in studio.py. */
export const SHADOW_FADE_PX = 24;

export type Edges = { top: number; bottom: number; left: number; right: number };

/**
 * Which pixels are the train, as 1s. From the mask the render wrote beside
 * it when there is one (`<render>-train.png`, the train alone). Without one,
 * from the picture: the shadow catcher writes its shadow black, never
 * brighter than 3 in any channel, so anything coloured or opaque is the
 * train. Either way widened by a pixel: the mask and the render anti-alias
 * the silhouette a little differently, and where black underframe meets its
 * own shadow the silhouette's edge is black too. (Checked against the masks
 * of 800-GW, 150-GW and 390-VT: fading everything else changes at most one
 * pixel of train, by 7.)
 */
export function trainMask(rgba: Uint8Array, width: number, height: number, mask?: Uint8Array): Uint8Array {
  const train = new Uint8Array(width * height);
  for (let p = 0; p < width * height; p++) {
    if (mask) train[p] = mask[p * 4 + 3] > 0 ? 1 : 0;
    else {
      const o = p * 4;
      train[p] = rgba[o + 3] >= 250 || Math.max(rgba[o], rgba[o + 1], rgba[o + 2]) > 3 ? 1 : 0;
    }
  }
  const grown = train.slice();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (train[p]) continue;
      if ((x > 0 && train[p - 1]) || (x < width - 1 && train[p + 1]) || (y > 0 && train[p - width]) || (y < height - 1 && train[p + width])) grown[p] = 1;
    }
  }
  return grown;
}

/** The most alpha the shadow (anything but the train) has at each edge of the frame. */
export function shadowAtEdges(rgba: Uint8Array, width: number, height: number, train: Uint8Array): Edges {
  const at = (x: number, y: number) => (train[y * width + x] ? 0 : rgba[(y * width + x) * 4 + 3]);
  const edges: Edges = { top: 0, bottom: 0, left: 0, right: 0 };
  for (let x = 0; x < width; x++) {
    edges.top = Math.max(edges.top, at(x, 0));
    edges.bottom = Math.max(edges.bottom, at(x, height - 1));
  }
  for (let y = 0; y < height; y++) {
    edges.left = Math.max(edges.left, at(0, y));
    edges.right = Math.max(edges.right, at(width - 1, y));
  }
  return edges;
}

export function edgesClear(edges: Edges): boolean {
  return Math.max(edges.top, edges.bottom, edges.left, edges.right) <= SHADOW_EDGE_ALPHA;
}

const smoothstep = (t: number) => {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
};

/**
 * The shadow faded to nothing over the last SHADOW_FADE_PX pixels before
 * each edge, as the shadow catcher now does when rendering. Train pixels
 * are left exactly as they were.
 */
export function fadeShadow(rgba: Uint8Array, width: number, height: number, train: Uint8Array, fade = SHADOW_FADE_PX): Uint8Array {
  const out = rgba.slice();
  const across = (i: number, n: number) => smoothstep((i + 0.5) / fade) * smoothstep((n - i - 0.5) / fade);
  const columns = Float64Array.from({ length: width }, (_, x) => across(x, width));
  for (let y = 0; y < height; y++) {
    const row = across(y, height);
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (train[p]) continue;
      out[p * 4 + 3] = Math.round(rgba[p * 4 + 3] * row * columns[x]);
    }
  }
  return out;
}
