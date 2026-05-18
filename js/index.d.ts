export interface MermaidConfig {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  fontFamily?: string;
  securityLevel?: string;
}

export interface RenderResult {
  svg: string;
  bindFunctions: () => void;
}

export interface ParseResult {
  diagramType: string;
}

export function initialize(config?: MermaidConfig): Promise<void>;
export function render(id: string, text: string): Promise<RenderResult>;
export function parse(text: string): Promise<ParseResult>;
export function run(options?: { nodes?: NodeListOf<Element> | Element[] }): Promise<void>;
export function contentLoaded(): Promise<void>;

declare const mermaid: {
  initialize: typeof initialize;
  render: typeof render;
  parse: typeof parse;
  run: typeof run;
  contentLoaded: typeof contentLoaded;
};
export default mermaid;
