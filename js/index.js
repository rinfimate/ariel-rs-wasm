import init, {
  render as wasmRender,
  try_render as wasmTryRender,
  detect as wasmDetect,
  set_font,
} from '../pkg/ariel_rs_wasm.js';

export const version = '0.1.0';

let initPromise = null;
let config = {
  theme: 'default',
  fontFamily: null,
  startOnLoad: false,
  securityLevel: 'strict',
  logLevel: 'fatal',
};

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
  // Merge config — per-diagram config objects (flowchart, sequence, etc.) are
  // accepted and stored but not currently forwarded to the renderer.
  config = { ...config, ...cfg };

  if (config.fontFamily && config.fontFamily !== 'default') {
    try {
      const bytes = await fetchFontBytes(config.fontFamily);
      if (bytes) set_font(bytes);
    } catch { /* font fetch failed — use bundled font */ }
  }

  if (config.startOnLoad) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => run());
    } else {
      await run();
    }
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

  // Match Mermaid JS behaviour: throw on Unknown (unrecognised syntax)
  if (diagramType === 'Unknown') {
    throw new Error(`No diagram type detected for: ${text.slice(0, 50)}`);
  }

  // Surface parse errors from try_render as thrown errors
  try {
    wasmTryRender(text, config.theme || 'default');
  } catch (e) {
    throw new Error(e.message || 'Parse error');
  }

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
    } catch { /* render failed — skip node */ }
  }
}

export function contentLoaded() {
  return run();
}

export function getConfig() {
  return { ...config };
}

export function reset() {
  config = {
    theme: 'default',
    fontFamily: null,
    startOnLoad: false,
    securityLevel: 'strict',
    logLevel: 'fatal',
  };
}

export default {
  version,
  initialize,
  render,
  parse,
  run,
  contentLoaded,
  getConfig,
  reset,
};

// Auto-process .mermaid elements on import — matches Mermaid JS default behaviour.
// Users get the CDN drop-in experience with no extra initialization code required.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => run());
  } else {
    run();
  }
}
