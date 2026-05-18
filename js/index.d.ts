export interface MermaidConfig {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  fontFamily?: string;
  startOnLoad?: boolean;
  securityLevel?: 'loose' | 'strict' | 'antiscript' | 'sandbox';
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  htmlLabels?: boolean;
  suppressErrors?: boolean;
  [key: string]: unknown;
}

export interface RenderResult {
  svg: string;
  /** No-op — ariel-rs SVGs are static with no interactive elements. */
  bindFunctions: () => void;
}

export interface ParseResult {
  diagramType: string;
}

export declare const version: string;

export declare function initialize(config?: MermaidConfig): Promise<void>;
export declare function render(id: string, text: string): Promise<RenderResult>;
/** Throws if the diagram type is unrecognised or the input has parse errors. */
export declare function parse(text: string): Promise<ParseResult>;
/** Returns the detected diagram type string, e.g. "Flowchart". Alias for detect(). */
export declare function detectType(text: string): Promise<string>;
export declare function run(options?: {
  nodes?: NodeListOf<Element> | Element[];
  querySelector?: string;
}): Promise<void>;
/** @deprecated Use run() instead. */
export declare function init(config?: MermaidConfig, selector?: string): Promise<void>;
export declare function contentLoaded(): Promise<void>;
export declare function getConfig(): MermaidConfig;
export declare function reset(): void;

declare const mermaid: {
  version: string;
  initialize: typeof initialize;
  render: typeof render;
  parse: typeof parse;
  detectType: typeof detectType;
  run: typeof run;
  init: typeof init;
  contentLoaded: typeof contentLoaded;
  getConfig: typeof getConfig;
  reset: typeof reset;
};
export default mermaid;
