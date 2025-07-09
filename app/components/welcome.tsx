"use client";

import { useMemo } from "react";

export default async function Welcome() {
  const embedUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.pathname = "/embed";
    return url.toString();
  }, []);

  return (
    <div className="flex flex-col items-center pt-16">
      <div className="flex flex-col gap-4 max-w-xl p-4 border rounded-md bg-bg3">
        <h1 className="font-bold text-2xl">LiveKit Embed Starter</h1>
        <p>
          The embed starter example contains an example implementation of an embeddable LiveKit control
          that can be added to a web app to talk to your agent, no custom javascript code required.
        </p>

        <h2 className="font-bold text-lg">Example</h2>
        <iframe
          src={embedUrl}
          style={{ width: 320, height: 64 }}
        />

        <h2 className="font-bold text-lg">Usage</h2>
        <p>
          To include the embed into a web app, paste the below embed HTML into the page:
        </p>
        <pre>
          {`<iframe\n  src="${embedUrl}"\n  style="width: 320px; height: 64px;"\n></iframe>`}
        </pre>
      </div>
    </div>
  );
}
