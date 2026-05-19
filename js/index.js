import wasmInit, {
  render as wasmRender,
  try_render as wasmTryRender,
  detect as wasmDetect,
  set_font,
  background_color as wasmBackgroundColor,
} from '../pkg/ariel_rs_wasm.js';

export const version = '0.1.1';

let initPromise = null;
let config = {
  theme: 'default',
  fontFamily: null,
  startOnLoad: false,
  securityLevel: 'strict',
  logLevel: 'fatal',
};

async function ensureInit() {
  if (!initPromise) initPromise = wasmInit();
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
  // Merge config — per-diagram config objects (flowchart, sequence, etc.)
  // are accepted and stored but not forwarded to the renderer.
  // securityLevel, htmlLabels, suppressErrors are accepted but have no effect —
  // ariel-rs SVGs are always static and contain no HTML or scripts.
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

function injectBackground(svg, theme) {
  const bg = wasmBackgroundColor(theme);
  const rect = `<rect width="100%" height="100%" fill="${bg}"/>`;
  const pos = svg.indexOf('>');
  return pos >= 0 ? svg.slice(0, pos + 1) + rect + svg.slice(pos + 1) : svg;
}

export async function render(id, text) {
  await ensureInit();
  const theme = config.theme || 'default';
  let svg = wasmRender(text, theme);
  svg = injectBackground(svg, theme);
  // Ensure the root <svg> has the caller-supplied id so that
  // document.querySelector(`#${id}`) works after innerHTML injection.
  if (svg.includes(`id="${id}"`)) {
    // already correct
  } else if (/\sid="[^"]*"/.test(svg.slice(0, svg.indexOf('>')))) {
    // replace existing id on root svg tag
    svg = svg.replace(/(\sid=")[^"]*(")/,  `$1${id}$2`);
  } else {
    // no id on root svg — inject one
    svg = svg.replace('<svg ', `<svg id="${id}" `);
  }
  const diagramType = wasmDetect(text);
  // bindFunctions is a no-op — ariel-rs SVGs are static with no interactions.
  return { svg, bindFunctions: () => {}, diagramType };
}

/** No-op — ariel-rs has built-in layout. Accepted for API compatibility. */
export function registerLayoutLoaders(_loaders) {}

/** No-op — ariel-rs has built-in diagram support. Returns resolved Promise for API compatibility. */
export function registerExternalDiagrams(_diagrams) {
  return Promise.resolve();
}

/** Partial mermaidAPI surface for compatibility with code that reads defaultConfig. */
export const mermaidAPI = {
  defaultConfig: {},
};

export async function parse(text) {
  await ensureInit();
  const diagramType = wasmDetect(text);

  // Match Mermaid JS behaviour: throw on Unknown (unrecognised diagram type)
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

/** Alias for parse() — matches Mermaid JS v10+ API. */
export async function detectType(text) {
  await ensureInit();
  return wasmDetect(text);
}

export async function run(options = {}) {
  await ensureInit();
  const selector = options.querySelector || '.mermaid';
  const nodes = options.nodes || document.querySelectorAll(selector);
  for (const node of nodes) {
    const source = node.textContent || '';
    try {
      const { svg } = await render(node.id || 'mermaid', source);
      node.innerHTML = svg;
    } catch { /* render failed — skip node */ }
  }
}

/** @deprecated Use run() instead. */
export async function init(cfg, selector) {
  if (cfg) await initialize(cfg);
  await run({ querySelector: selector });
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
  detectType,
  run,
  init,
  contentLoaded,
  getConfig,
  reset,
  registerLayoutLoaders,
  registerExternalDiagrams,
  mermaidAPI,
};

// Auto-process .mermaid elements on import — matches Mermaid JS default behaviour.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => run());
  } else {
    run();
  }
}
