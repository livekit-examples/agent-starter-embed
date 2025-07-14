import ReactDOM from 'react-dom/client';
import EmbedFixedAgentClient, { EmbedFixedAgentClientProps } from './agent-client';
import { APP_CONFIG_DEFAULTS } from '@/app-config';

import globalCss from '../../app/globals.css';

const wrapper = document.createElement("div");
wrapper.setAttribute("id", "lk-embed-wrapper");
document.body.appendChild(wrapper);

const shadowRoot = wrapper.attachShadow({ mode: 'open' });

const styleTag = document.createElement("style");
styleTag.textContent = globalCss;
shadowRoot.appendChild(styleTag);

const reactRoot = document.createElement("div");
shadowRoot.appendChild(reactRoot);

const root = ReactDOM.createRoot(reactRoot);
// root.render(<EmbedFixedAgentClient {...props} />);
root.render(<EmbedFixedAgentClient appConfig={APP_CONFIG_DEFAULTS} />);

// export default LiveKitEmbedFixed;
