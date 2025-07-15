'use client';

import { useMemo, useState } from 'react';
import Script from 'next/script';
import { ArrowRightIcon, CheckIcon } from '@phosphor-icons/react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import EmbedPopupAgentClient from './embed-popup/agent-client';
import { Button } from './ui/button';

export default function Welcome() {
  const embedUrl = useMemo(() => {
    const url = new URL('/embed', window.location.origin);
    return url.toString();
  }, []);

  const embedPopupUrl = useMemo(() => {
    const url = new URL('/embed-popup.js', window.location.origin);
    return url.toString();
  }, []);

  const [appendScript, setAppendScript] = useState(false);
  const activateGlobalPopup = () => {
    setAppendScript(true);
  };

  return (
    <div className="flex flex-col items-center py-16">
      <div className="bg-bg3 flex max-w-xl flex-col gap-4 rounded-md border p-4">
        <h1 className="text-2xl font-bold">LiveKit Embed Starter</h1>
        <p>
          The embed starter example contains an example implementation of an embeddable LiveKit
          control that can be added to a web app to talk to your agent, no custom javascript code
          required.
        </p>

        <h2 className="text-lg font-bold">Examples</h2>
        <p>There are two different styles of embeds - an iframe style, and a popup style.</p>

        <h3 className="text-lg font-bold">IFrame Style</h3>
        <iframe src={embedUrl} style={{ width: 320, height: 64 }} />

        <p>
          To include the iframe style embed into a web app, paste the below embed HTML into the
          page:
        </p>
        <pre className="overflow-auto">
          {`<iframe\n  src="${embedUrl}"\n  style="width: 320px; height: 64px;"\n></iframe>`}
        </pre>

        <h3 className="text-lg font-bold">Popup Style</h3>
        <div className="border-fg4 relative flex h-[256px] w-full items-center justify-center rounded-sm border border-dashed">
          <p className="text-fg3 text-sm font-medium select-none">Your web page here</p>

          <div className="absolute right-20 bottom-7 flex items-center gap-1">
            <span className="text-primary text-sm font-medium select-none">Click here to open</span>
            <ArrowRightIcon size={16} className="text-primary" />
          </div>
          <div className="absolute right-4 bottom-4">
            <EmbedPopupAgentClient appConfig={APP_CONFIG_DEFAULTS} buttonPosition="static" />
          </div>
        </div>

        <p className="text-sm">
          Note: if you&apos;d like to see what the popup style embed looks like in the context of
          this page,{' '}
          <Button variant="link" className="px-0 normal-case" onClick={activateGlobalPopup}>
            click here
          </Button>
          .
          {appendScript ? (
            <span className="ml-3 inline-flex flex-row items-center gap-1 text-green-400">
              <CheckIcon size={12} />
              <span className="text-sm">Added script tag to body, give it a try!</span>
            </span>
          ) : null}
        </p>

        <p>
          To include the popup style embed into a web app, paste the below embed HTML into the
          bottom of the <code>&lt;body&gt;</code> tag:
        </p>
        <pre className="overflow-auto">{`<script src="${embedPopupUrl}"></script>`}</pre>
      </div>

      {appendScript ? <Script src={embedPopupUrl} strategy="lazyOnload" /> : null}
    </div>
  );
}
