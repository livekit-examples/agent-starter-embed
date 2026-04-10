import type { AppConfig } from './types';

/**
 * Generate inline CSS that overrides accent color variables from app config.
 * Follows the same pattern as agent-starter-react.
 */
export function getStyles(appConfig: AppConfig): string {
  const { accent, accentDark } = appConfig;

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
