<img src="./.github/assets/app-icon.png" alt="Voice Assistant App Icon" width="100" height="100">

# Web Embed Agent Starter

This is a starter template for [LiveKit Agents](https://docs.livekit.io/agents) that provides an example of how you might approach building web embed using the [LiveKit JavaScript SDK](https://github.com/livekit/client-sdk-js). It supports [voice](https://docs.livekit.io/agents/start/voice-ai) and [transcriptions](https://docs.livekit.io/agents/build/text/).

This template is built with Next.js and is free for you to use or modify as you see fit.

![App screenshot](/.github/assets/frontend-screenshot.png)

## Getting started

> [!TIP]
> If you'd like to try this application without modification, you can deploy an instance in just a few clicks with [LiveKit Cloud Sandbox](https://cloud.livekit.io/projects/p_/sandbox/templates/embed).

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

## Local Development

http://localhost:3000 will respond to code changes in real time through [NextJS Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh) to support a rapid iteration feedback loop.

## Production deployment of embed-popup.js script

Any code changes you see locally will not be reflected in `embed-popup.js` until you run `pnpm build-embed-popup-script`.

You can test your latest build of `embed-popup.js` at http://localhost:3000/popover.

## Contributing

This template is open source and we welcome contributions! Please open a PR or issue through GitHub, and don't forget to join us in the [LiveKit Community Slack](https://livekit.io/join-slack)!
