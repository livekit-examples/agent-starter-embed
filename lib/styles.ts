import type { AppConfig } from './types';

/**
 * Generate inline CSS that overrides accent color variables from app config.
 * Follows the same pattern as agent-starter-react.
 *
 * Uses :root/.dark for iframe (full document) context.
 * Use getShadowStyles() for popup (shadow DOM) context.
 */
export function getStyles(appConfig: AppConfig): string {
  const accent = appConfig.accent || undefined;
  const accentDark = appConfig.accentDark || undefined;

  return [
    accent
      ? `:root { --primary: ${accent}; --primary-hover: color-mix(in srgb, ${accent} 80%, #000); --fgAccent: ${accent}; }`
      : '',
    accentDark
      ? `.dark { --primary: ${accentDark}; --primary-hover: color-mix(in srgb, ${accentDark} 80%, #000); --fgAccent: ${accentDark}; }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Generate inline CSS for use inside a shadow DOM.
 * Uses :host instead of :root since :root targets the document element,
 * not the shadow host.
 */
export function getShadowStyles(appConfig: AppConfig): string {
  const accent = appConfig.accent || undefined;
  const accentDark = appConfig.accentDark || undefined;

  return [
    accent
      ? `:host { --primary: ${accent}; --primary-hover: color-mix(in srgb, ${accent} 80%, #000); --fgAccent: ${accent}; }`
      : '',
    accentDark
      ? `:host(.dark) { --primary: ${accentDark}; --primary-hover: color-mix(in srgb, ${accentDark} 80%, #000); --fgAccent: ${accentDark}; }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}
