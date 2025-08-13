export function getStyleUrl() {
  const url = (import.meta.env?.VITE_MAP_STYLE_URL || "").trim();
  // Known-good, public fallback (no token required). Override via VITE_MAP_STYLE_URL.
  return url || "https://demotiles.maplibre.org/style.json";
}
