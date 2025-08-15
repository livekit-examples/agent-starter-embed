import { THEME_MEDIA_QUERY } from '@/lib/env';

const THEME_SCRIPT = `
  const doc = document.documentElement;
  const theme = new URLSearchParams(window.location.search).get('theme') ?? 'dark';

  if (theme === "system") {
    if (window.matchMedia("${THEME_MEDIA_QUERY}").matches) {
      doc.classList.add("dark");
    } else {
      doc.classList.add("light");
    }
  } else {
    doc.classList.add(theme);
  }
`
  .trim()
  .replace(/\n/g, '')
  .replace(/\s+/g, ' ');

export function ApplyThemeScript() {
  return <script id="theme-script">{THEME_SCRIPT}</script>;
}
