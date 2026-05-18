# ariel-rs-wasm

[![CI](https://github.com/rinfimate/ariel-rs-wasm/actions/workflows/ci.yml/badge.svg)](https://github.com/rinfimate/ariel-rs-wasm/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@rinfimate/ariel-rs-wasm.svg)](https://www.npmjs.com/package/@rinfimate/ariel-rs-wasm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A WebAssembly build of [ariel-rs](https://crates.io/crates/ariel-rs) — a pure-Rust Mermaid diagram renderer. **API-compatible** with the official `mermaid` npm package for the common rendering use case.

## What it is

`ariel-rs-wasm` compiles `ariel-rs` to WebAssembly via [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) and wraps it in a Mermaid JS-compatible API surface. Diagrams are rendered to SVG entirely in the browser — no Node.js, no Puppeteer, no network round-trip.

## Installation

```sh
npm install @rinfimate/ariel-rs-wasm
```

## CDN usage

```html
<pre class="mermaid">
  graph LR
  A --> B --> C
</pre>

<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/@rinfimate/ariel-rs-wasm@0.1.0/js/index.js';
</script>
```

`.mermaid` elements are processed automatically on import — no `initialize()` call needed.

## npm usage

Change a single import line:

```js
// Before:
import mermaid from 'mermaid';

// After:
import mermaid from '@rinfimate/ariel-rs-wasm';
```

Then use it exactly as you would the official package:

```js
await mermaid.initialize({ theme: 'dark' });

const { svg } = await mermaid.render('diagram-id', `
  graph LR
    A --> B
`);
document.getElementById('output').innerHTML = svg;
```

## API compatibility

| Method / Config | Supported | Notes |
|---|---|---|
| `mermaid.initialize(config)` | ✓ | |
| `mermaid.render(id, text)` | ✓ | |
| `mermaid.parse(text)` | ✓ | Throws on unknown type / parse error |
| `mermaid.detectType(text)` | ✓ | |
| `mermaid.run(options)` | ✓ | `nodes` and `querySelector` supported |
| `mermaid.getConfig()` | ✓ | |
| `mermaid.reset()` | ✓ | |
| `mermaid.init()` | ✓ | Deprecated alias for `run()` |
| `mermaid.contentLoaded()` | ✓ | Alias for `run()` |
| `startOnLoad` config | ✓ | |
| `theme` config | ✓ | default, dark, forest, neutral |
| `fontFamily` config | ✓ | Fetched from Google Fonts |
| `securityLevel` config | Accepted, no effect | SVGs are always static — no HTML or scripts |
| `htmlLabels` config | Accepted, no effect | Headless renderer, no DOM parser |
| `suppressErrors` config | Accepted, no effect | Errors always produce error SVGs |
| `bindFunctions(element)` | No-op | ariel-rs SVGs have no interactive elements |
| `fa:fa-*` Font Awesome icons | ✗ | Renders as literal text |
| CSS font cascade from host page | ✗ | Use `fontFamily` config instead |
| Click / tooltip interactions | ✗ | SVG output is static |

## Font support

Pass a `fontFamily` to `initialize` to load a custom font from Google Fonts:

```js
await mermaid.initialize({ theme: 'dark', fontFamily: 'Inter' });
```

The font bytes are fetched from `fonts.googleapis.com` and forwarded to the WASM module for text measurement. If the fetch fails, the bundled default font (Liberation Sans) is used transparently.

> **Note:** CSS rules applied to `.mermaid` elements (e.g. `pre.mermaid { font-family: ... }`) have no effect on the rendered SVG. Pass `fontFamily` to `initialize()` instead.

## Build from source

```sh
cargo install wasm-pack
wasm-pack build --target web
```

For bundler targets (webpack, Vite, Rollup):

```sh
wasm-pack build --target bundler
```

The compiled output lands in `pkg/`.

## License

MIT © 2026 Rochanglien Infimate
