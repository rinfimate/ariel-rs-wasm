use wasm_bindgen::prelude::*;

fn parse_theme(theme: &str) -> ariel_rs::theme::Theme {
    match theme {
        "dark" => ariel_rs::theme::Theme::Dark,
        "forest" => ariel_rs::theme::Theme::Forest,
        "neutral" => ariel_rs::theme::Theme::Neutral,
        _ => ariel_rs::theme::Theme::Default,
    }
}

/// Render a Mermaid diagram string to SVG. Returns an error SVG on bad input — never throws.
#[wasm_bindgen]
pub fn render(input: &str, theme: &str) -> String {
    let t = parse_theme(theme);
    ariel_rs::render(input, t)
}

/// Render a Mermaid diagram string to SVG. Returns Err on bad input.
#[wasm_bindgen]
pub fn try_render(input: &str, theme: &str) -> Result<String, JsError> {
    let t = parse_theme(theme);
    ariel_rs::try_render(input, t).map_err(|e| JsError::new(&e.to_string()))
}

/// Detect the diagram type keyword. Returns e.g. "Flowchart", "Sequence", "Unknown".
#[wasm_bindgen]
pub fn detect(input: &str) -> String {
    format!("{:?}", ariel_rs::detect(input))
}

/// Override the bundled font with custom bytes for text measurement.
/// Call this from JS after fetching a font file.
#[wasm_bindgen]
pub fn set_font(_bytes: &[u8]) {
    // TODO: wire into ariel-rs text measurement when font_data is supported
}
