'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { HandPointingIcon } from '@phosphor-icons/react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import { THEME_STORAGE_KEY } from '@/lib/env';
import type { ThemeMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import EmbedPopupAgentClient from './embed-popup/agent-client';
import { ThemeToggle } from './theme-toggle';

export default function Welcome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTab = searchParams.get('tab') ?? 'iframe';
  const [, forceUpdate] = useState(0);
  const theme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) ?? 'dark';

  const embedUrl = useMemo(() => {
    const url = new URL('/embed', window.location.origin);
    url.searchParams.set('theme', theme);
    return url.toString();
  }, [theme]);

  const embedPopupUrl = useMemo(() => {
    const url = new URL('/embed-popup.js', window.location.origin);
    return url.toString();
  }, []);

  const handleClickIframe = () => {
    router.push(`${pathname}?tab=iframe`);
  };

  const handleClickPopover = () => {
    router.push(`${pathname}?tab=popover`);
  };

  return (
    <div className="text-fg1 mx-auto flex min-h-screen max-w-prose flex-col py-4 md:justify-center md:py-20">
      <div className="h-[520px] space-y-8 px-4">
        <div className="items-top flex justify-between">
          <h1 className="text-fg0 text-2xl font-bold text-pretty">LiveKit Agent Embed Starter</h1>
          <div className="mt-1">
            <div className="sr-only">Toggle theme:</div>
            <ThemeToggle className="w-auto" onClick={() => forceUpdate((c) => c + 1)} />
          </div>
        </div>

        <p>
          The embed agent starter example is a low-code solution to embed a LiveKit Agent into an
          existing website or web application.
        </p>

        <div>
          <div className="text-fg0 mb-1 font-semibold">Select a variant</div>
          <div className="border-separator2 rounded-xl border p-1">
            <div className="relative flex gap-2">
              <motion.div
                key="selectedTab"
                layout="position"
                layoutId="tab-indicator"
                initial={false}
                animate={selectedTab === 'iframe' ? { left: 0 } : { left: '50%' }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
                className="bg-bgAccent/50 dark:bg-bgAccent border-primary/20 dark:border-separatorAccent absolute top-0 h-full w-1/2 rounded-lg border"
              />
              <button
                type="button"
                onClick={handleClickIframe}
                className={cn(
                  'text-fg2 focus:text-fgAccent hover:text-fgAccent z-10 flex-1 cursor-pointer py-2 font-mono transition-colors',
                  selectedTab === 'iframe' && 'text-fgAccent font-bold'
                )}
              >
                iFrame
              </button>
              <button
                type="button"
                onClick={handleClickPopover}
                className={cn(
                  'text-fg2 focus:text-fgAccent hover:text-fgAccent z-10 flex-1 cursor-pointer py-2 font-mono transition-colors',
                  selectedTab === 'popover' && 'text-fgAccent font-bold'
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
              <h4 className="text-fg0 mb-1 font-semibold">Embed code</h4>
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
            <div className="flex justify-center">
              <iframe src={embedUrl} style={{ width: 320, height: 64 }} />
            </div>
          </>
        )}

        {selectedTab === 'popover' && (
          <>
            <h3 className="sr-only text-lg font-semibold">Popover Style</h3>
            <div>
              <h4 className="text-fg0 mb-1 font-semibold">Embed code</h4>
              <pre className="border-separator2 bg-bg2 overflow-auto rounded-md border px-2 py-1">
                {`<script src="${embedPopupUrl}"></script>`}
              </pre>
            </div>
            <div className="flex justify-center">
              <div className="text-fgAccent flex gap-1">
                <p className="grow text-sm">
                  The popover button should appear in the bottom right corner of the screen
                </p>
                <HandPointingIcon
                  size={16}
                  weight="regular"
                  className="mt-0.5 inline shrink-0 rotate-[145deg] animate-bounce"
                />
              </div>
            </div>
            <EmbedPopupAgentClient appConfig={APP_CONFIG_DEFAULTS} />
          </>
        )}
      </div>
    </div>
  );
}
