// js/index.js
import init, { render as wasmRender, try_render as wasmTryRender, detect as wasmDetect, set_font } from '../pkg/ariel_rs_wasm.js';

let initPromise = null;
let config = { theme: 'default', fontFamily: null };

async function ensureInit() {
  if (!initPromise) initPromise = init();
  return initPromise;
}

async function fetchFontBytes(family) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}`
  ).then(r => r.text());
  const match = css.match(/url\(([^)]+)\)/);
  if (!match) return null;
  const buf = await fetch(match[1]).then(r => r.arrayBuffer());
  return new Uint8Array(buf);
}

export async function initialize(cfg = {}) {
  await ensureInit();
  config = { ...config, ...cfg };
  if (config.fontFamily && config.fontFamily !== 'default') {
    try {
      const bytes = await fetchFontBytes(config.fontFamily);
      if (bytes) set_font(bytes);
    } catch (_) { /* font fetch failed — use bundled font */ }
  }
}

export async function render(id, text) {
  await ensureInit();
  const svg = wasmRender(text, config.theme || 'default');
  return { svg, bindFunctions: () => {} };
}

export async function parse(text) {
  await ensureInit();
  const diagramType = wasmDetect(text);
  return { diagramType };
}

export async function run(options = {}) {
  await ensureInit();
  const nodes = options.nodes || document.querySelectorAll('.mermaid');
  for (const node of nodes) {
    const source = node.textContent || '';
    try {
      const { svg } = await render(node.id || 'mermaid', source);
      node.innerHTML = svg;
    } catch (_) {}
  }
}

export function contentLoaded() {
  return run();
}

export default { initialize, render, parse, run, contentLoaded };
