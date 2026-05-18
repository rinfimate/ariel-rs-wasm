# ariel-rs-wasm

[![CI](https://github.com/rinfimate/ariel-rs-wasm/actions/workflows/ci.yml/badge.svg)](https://github.com/rinfimate/ariel-rs-wasm/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@rinfimate/ariel-rs-wasm.svg)](https://www.npmjs.com/package/@rinfimate/ariel-rs-wasm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A WebAssembly build of [ariel-rs](https://crates.io/crates/ariel-rs) — a pure-Rust Mermaid diagram renderer. Drop it in as a headless, zero-JS-runtime replacement for the official `mermaid` npm package.

## What it is

`ariel-rs-wasm` compiles `ariel-rs` to WebAssembly via [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) and wraps it in a Mermaid JS-compatible API surface. Diagrams are rendered to SVG entirely in the browser, with no Node.js, no Puppeteer, and no network round-trip.

## Installation

```sh
npm install @rinfimate/ariel-rs-wasm
```

## Usage

Change a single import line — the API is a drop-in for `mermaid`:

```js
// Before:
import mermaid from 'mermaid';

// After:
import mermaid from '@rinfimate/ariel-rs-wasm';
```

Then use it exactly as you would the official package:

```js
await mermaid.initialize({ theme: 'default' });

const { svg } = await mermaid.render('diagram-id', `
  graph LR
    A --> B
`);
document.getElementById('output').innerHTML = svg;
```

## API

All functions are async and return Promises.

### `initialize(config?)`

Configure the renderer before first use. Options:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `theme` | `'default' \| 'dark' \| 'forest' \| 'neutral'` | `'default'` | Colour theme |
| `fontFamily` | `string` | `null` | CSS font-family (fetched from Google Fonts) |

### `render(id, text)`

Render a Mermaid diagram string to SVG. Returns `{ svg: string, bindFunctions: () => void }`.
Never throws — returns an error SVG on bad input.

### `parse(text)`

Detect the diagram type without rendering. Returns `{ diagramType: string }`, e.g. `"Flowchart"`, `"Sequence"`, `"Unknown"`.

### `run(options?)`

Render all `.mermaid` elements in the document (or a supplied `nodes` list) in place.

### `contentLoaded()`

Alias for `run()`. Attach to `DOMContentLoaded` for automatic rendering.

## Font support

Pass a `fontFamily` to `initialize` to load a custom font from Google Fonts:

```js
await mermaid.initialize({ theme: 'dark', fontFamily: 'Inter' });
```

The font bytes are fetched from `fonts.googleapis.com` and forwarded to the WASM module. If the fetch fails, the bundled default font is used transparently.

## Build from source

You need [wasm-pack](https://rustwasm.github.io/wasm-pack/):

```sh
cargo install wasm-pack
wasm-pack build --target web
```

Or for bundler targets (webpack, Vite, Rollup):

```sh
wasm-pack build --target bundler
```

The compiled output lands in `pkg/`.

## License

MIT
