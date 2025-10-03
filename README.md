# Web Embed Agent Starter

This is a starter template for [LiveKit Agents](https://docs.livekit.io/agents) that provides an example of how you might approach building web embed using the [LiveKit JavaScript SDK](https://github.com/livekit/client-sdk-js). It supports [voice](https://docs.livekit.io/agents/start/voice-ai) and [transcriptions](https://docs.livekit.io/agents/build/text/).

This template is built with Next.js and is free for you to use or modify as you see fit.

<picture>
  <source srcset="./.github/assets/readme-hero-dark.webp" media="(prefers-color-scheme: dark)">
  <source srcset="./.github/assets/readme-hero-light.webp" media="(prefers-color-scheme: light)">
  <img src="./.github/assets/readme-hero-light.webp" alt="App screenshot">
</picture>

### Features:

- Real-time voice interaction with LiveKit Agents
- Camera video streaming support
- Screen sharing capabilities
- Audio visualization and level monitoring
- Virtual avatar integration
- Light/dark theme switching with system preference detection
- Customizable branding, colors, and UI text via configuration

This template is built with Next.js and is free for you to use or modify as you see fit.

### Project structure

```
agent-starter-react/
├── app/
│   ├── (app)/
│   ├── (iframe)/
│   ├── api/
│   ├── test/
│   ├── favicon.ico
├── components/
│   ├── embed-iframe/
│   ├── embed-popup/
│   ├── livekit/
│   ├── ui/
│   ├── popup-page.tsx
│   ├── root-layout.tsx
│   └── theme-toggle.tsx
│   └── welcome.tsx
│   └── ...
├── hooks/
├── lib/
├── public/
├── styles/
└── package.json
```

## Getting started

> [!TIP]
> If you'd like to try this application without modification, you can deploy an instance in just a few clicks with [LiveKit Cloud Sandbox](https://cloud.livekit.io/projects/p_/sandbox/templates/agent-starter-embed).

[![Open on LiveKit](https://img.shields.io/badge/Open%20on%20LiveKit%20Cloud-002CF2?style=for-the-badge&logo=external-link)](https://cloud.livekit.io/projects/p_/sandbox/templates/agent-starter-embed)

Run the following command to automatically clone this template.

```bash
lk app create --template agent-starter-embed
```

Then run the app with:

```bash
pnpm install
pnpm build-embed-popup-script # Builds the embed-popup.js script
pnpm dev
```

Open http://localhost:3000 in your browser to experience the 2 embeddable demos.

You'll also need an agent to speak with. Try our starter agent for [Python](https://github.com/livekit-examples/agent-starter-python), [Node.js](https://github.com/livekit-examples/agent-starter-node), or [create your own from scratch](https://docs.livekit.io/agents/start/voice-ai/).

> [!NOTE]
> If you need to modify the LiveKit project credentials used, you can edit `.env.local` (copy from `.env.example` if you don't have one) to suit your needs.

## Configuration

This starter is designed to be flexible so you can adapt it to your specific agent use case. You can easily configure it to work with different types of inputs and outputs:

#### Example: App configuration (`app-config.ts`)

```ts
export const APP_CONFIG_DEFAULTS = {
  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,
};
```

You can update these values in [`app-config.ts`](./app-config.ts) to customize branding, features, and UI text for your deployment.

#### Environment Variables

You'll also need to configure your LiveKit credentials in `.env.local` (copy `.env.example` if you don't have one):

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=https://your-livekit-server-url

NEXT_PUBLIC_CONN_DETAILS_ENDPOINT=http://localhost:3000/api/connection-details
```

These are required for the voice agent functionality to work with your LiveKit project.

## Local Development

http://localhost:3000 will respond to code changes in real time through [NextJS Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh) to support a rapid iteration feedback loop.

## Production deployment of embed-popup.js script

Once your environment is set up and you've made any configuration changes, you can copy the embed code generated on the welcome page of your LiveKit Sandbox and paste it into your website.

> [!IMPORTANT]
> You MUST use the embed code generated on the welcome page of your LiveKit Sandbox to ensure LiveKit connection tokens are generated correctly.

## Debugging the build of embed-popup.js script

You can test and debug your latest build of `embed-popup.js` locally at http://localhost:3000/test/popup.

> [!IMPORTANT]
> Code changes you make locally will not be reflected in the bundled `embed-popup.js` script until you run `pnpm build-embed-popup-script`.

## Contributing

This template is open source and we welcome contributions! Please open a PR or issue through GitHub, and don't forget to join us in the [LiveKit Community Slack](https://livekit.io/join-slack)!
