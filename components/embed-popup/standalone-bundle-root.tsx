import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { getAppConfig } from '@/lib/env';
import globalCss from '@/styles/globals.css';
import EmbedFixedAgentClient from './agent-client';

const wrapper = document.createElement('div');
wrapper.setAttribute('id', 'lk-embed-wrapper');
document.body.appendChild(wrapper);

// Use a shadow root so that any relevant css classes don't leak out and effect the broader page
const shadowRoot = wrapper.attachShadow({ mode: 'open' });

// Include all app styles into the shadow root
// FIXME: this includes styles for the welcome page / etc, not just the popup embed!
const styleTag = document.createElement('style');
styleTag.textContent = globalCss;
shadowRoot.appendChild(styleTag);

const reactRoot = document.createElement('div');
shadowRoot.appendChild(reactRoot);

getAppConfig(window.location.origin)
  .then((appConfig) => {
    const root = ReactDOM.createRoot(reactRoot);
    root.render(<EmbedFixedAgentClient appConfig={appConfig} />);
  })
  .catch((err) => {
    console.error('Error loading livekit embed-popup app config:', err);
  });
