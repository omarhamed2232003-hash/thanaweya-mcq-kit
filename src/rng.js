/**
 * Small, dependency-free deterministic RNG.
 * Same seed + same bank => same quiz, which is what makes the engine testable
 * and lets a session be rebuilt from a URL or a saved record.
 */

/** FNV-1a 32-bit hash of a string. */
export function hashString(input) {
  let hash = 0x811c9dc5;
  const text = String(input);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: tiny 32-bit PRNG, good enough for shuffling quiz items. */
export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create a seeded random helper.
 * @param {number|string} seed
 */
export function createRng(seed) {
  const numericSeed = typeof seed === 'number' ? seed >>> 0 : hashString(seed ?? Date.now());
  const next = mulberry32(numericSeed);

  /** Integer in [0, max). */
  const int = (max) => Math.floor(next() * max);

  /** In-place Fisher-Yates shuffle; returns a new array. */
  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = int(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const pick = (items) => (items.length ? items[int(items.length)] : undefined);

  return { seed: numericSeed, next, int, shuffle, pick };
}
