'use client';

import { useMemo } from "react";

import EmbedFixedAgentClient from "./embed-fixed/agent-client";
import Script from "next/script";
import { APP_CONFIG_DEFAULTS } from "@/app-config";

export default function Welcome() {
  const embedUrl = useMemo(() => {
    const url = new URL('/embed', window.location.origin);
    return url.toString();
  }, []);

  return (
    <div className="flex flex-col items-center pt-16">
      <div className="bg-bg3 flex max-w-xl flex-col gap-4 rounded-md border p-4">
        <h1 className="text-2xl font-bold">LiveKit Embed Starter</h1>
        <p>
          The embed starter example contains an example implementation of an embeddable LiveKit
          control that can be added to a web app to talk to your agent, no custom javascript code
          required.
        </p>

        <h2 className="text-lg font-bold">Example</h2>
        <iframe src={embedUrl} style={{ width: 320, height: 64 }} />

        <EmbedFixedAgentClient
          appConfig={APP_CONFIG_DEFAULTS}
          buttonPosition="static"
        />

        <h2 className="font-bold text-lg">Usage</h2>
        <p>
          To include the embed into a web app, paste the below embed HTML into the page:
        </p>
        <pre>
          {`<iframe\n  src="${embedUrl}"\n  style="width: 320px; height: 64px;"\n></iframe>`}
        </pre>
      </div>

      {/* <Script src="/embed-fixed.js" strategy="lazyOnload" /> */}
    </div>
  );
}
