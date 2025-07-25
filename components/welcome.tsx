'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import { cn } from '@/lib/utils';
import EmbedPopupAgentClient from './embed-popup/agent-client';

export default function Welcome() {
  const [selectedTab, setSelectedTab] = useState<'iframe' | 'popover'>('iframe');

  const embedUrl = useMemo(() => {
    const url = new URL('/embed', window.location.origin);
    return url.toString();
  }, []);

  const embedPopupUrl = useMemo(() => {
    const url = new URL('/embed-popup.js', window.location.origin);
    return url.toString();
  }, []);

  return (
    <div className="text-fg1 mx-auto flex min-h-screen max-w-prose flex-col justify-center py-20">
      <div className="h-[700px] space-y-8 rounded-md">
        <h1 className="text-fg0 text-2xl font-bold">LiveKit Agent Embed Starter</h1>
        <p>
          The embed agent starter example is a low-code solution to embed a LiveKit Agent into an
          existing website or web application.
        </p>

        <div>
          <div className="text-fg0 mb-1 font-semibold">Select a variant:</div>
          <div className="border-separator2 rounded-xl border p-1">
            <div className="relative flex gap-2">
              <motion.div
                key="selectedTab"
                layout="position"
                layoutId="tab-indicator"
                initial={{ left: 0 }}
                animate={selectedTab === 'iframe' ? { left: 0 } : { left: '50%' }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
                className="bg-bg2 border-separator2 absolute top-0 h-full w-1/2 rounded-lg border"
              />
              <button
                type="button"
                onClick={() => setSelectedTab('iframe')}
                className={cn(
                  'text-fg2 focus:text-fg0 hover:text-fg0 z-10 flex-1 cursor-pointer py-2 font-mono',
                  selectedTab === 'iframe' && 'text-fg0'
                )}
              >
                iFrame
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('popover')}
                className={cn(
                  'text-fg2 focus:text-fg0 hover:text-fg0 z-10 flex-1 cursor-pointer py-2 font-mono',
                  selectedTab === 'popover' && 'text-fg0'
                )}
              >
                Popover
              </button>
            </div>
          </div>
        </div>

        {selectedTab === 'iframe' && (
          <>
            <h3 className="sr-only text-lg font-semibold">IFrame Style</h3>

            <div>
              <h4 className="text-fg0 mb-1 font-semibold">Demo</h4>
              <iframe src={embedUrl} style={{ width: 320, height: 64 }} />
            </div>

            <div>
              <h4 className="text-fg0 mb-1 font-semibold">Code</h4>
              <pre className="border-separator2 bg-bg2 overflow-auto rounded-md border px-2 py-1">
                {`<iframe\n  src="`}
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {embedUrl}
                </a>
                {`"\n  style="width: 320px; height: 64px;"\n></iframe>`}
              </pre>
            </div>
          </>
        )}

        {selectedTab === 'popover' && (
          <>
            <h3 className="sr-only text-lg font-semibold">Popover Style</h3>
            <div>
              <h4 className="text-fg0 mb-1 font-semibold">Demo</h4>
              <EmbedPopupAgentClient appConfig={APP_CONFIG_DEFAULTS} buttonPosition="fixed" />
              <p className="text-sm">
                The embedded popover agent activation button should be in the bottom right corner of
                the screen.
              </p>
            </div>

            <div>
              <h4 className="text-fg0 mb-1 font-semibold">Code</h4>
              <pre className="border-separator2 bg-bg2 overflow-auto rounded-md border px-2 py-1">
                {`<script src="${embedPopupUrl}"></script>`}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
