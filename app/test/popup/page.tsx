'use client';

import Script from 'next/script';
import './styles.css';

const CODE_SNIPPET = `
function toggleTheme() {
  var embedWrapper = document.querySelector('#lk-embed-wrapper');

  if (embedWrapper) {
    embedWrapper.classList.toggle('dark');
  }
}
`.trim();

export default function Page() {
  function handleToggleTheme() {
    const doc = document.documentElement;
    const popupWrapper = document.querySelector('#lk-embed-wrapper');

    doc.classList.toggle('page-dark');

    if (popupWrapper) {
      popupWrapper.classList.toggle('dark');
    }
  }

  return (
    <div>
      <p>This page has a minimal stylesheet inorder to test the embed-popup.js bundled styles</p>
      <p>
        Ensure you have run <code>pnpm build-embed-popup-script</code> after your latest code
        changes.
      </p>
      <p>
        In order to toggle the theme on the popup, <br />
        apply the class `dark` to the root element (#lk-embed-wrapper)
      </p>

      <pre>
        <code>{CODE_SNIPPET}</code>
      </pre>

      <p>
        <button onClick={handleToggleTheme}>toggle theme</button>
      </p>
      <Script src="/embed-popup.js" />
    </div>
  );
}
