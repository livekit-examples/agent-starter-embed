'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckIcon, CopyIcon, HandPointingIcon } from '@phosphor-icons/react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import { THEME_STORAGE_KEY, getSandboxId } from '@/lib/env';
import type { ThemeMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import EmbedPopupAgentClient from './embed-popup/agent-client';
import { ThemeToggle } from './theme-toggle';

export default function Welcome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const selectedTab = tabParam ? (tabParam === 'popup' ? 'popup' : 'iframe') : 'iframe';
  const [, forceUpdate] = useState(0);
  const theme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) ?? 'dark';
  const IS_SANDBOX_ENVIRONMENT = process.env.NODE_ENV === 'production';

  const [copied, setCopied] = useState(false);
  const copyEmbedCode = useCallback((embedCode: string) => {
    navigator.clipboard.writeText(embedCode);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, []);

  const iframeEmbedUrl = useMemo(() => {
    const url = new URL('/embed', window.location.origin);
    url.searchParams.set('theme', theme);
    return url.toString();
  }, [theme]);

  const popupEmbedUrl = useMemo(() => {
    const url = new URL('/embed-popup.js', window.location.origin);
    return url.toString();
  }, []);

  const embedSandboxId = useMemo(() => getSandboxId(window.location.origin), []);

  const popupEmbedCode = useMemo(
    () => `<script\n  src="${popupEmbedUrl}"\n  data-lk-sandbox-id="${embedSandboxId}"\n></script>`,
    [popupEmbedUrl, embedSandboxId]
  );
  const iframeEmbedCode = useMemo(() => {
    return `<iframe\n  src="${iframeEmbedUrl}"\n  style="width: 320px; height: 64px;"\n></iframe>`;
  }, [iframeEmbedUrl]);

  const popupTestUrl = useMemo(() => {
    const url = new URL('/test/popup', window.location.origin);
    return url.toString();
  }, []);

  const handleClickIframe = () => {
    router.push(`${pathname}?tab=iframe`);
  };

  const handleClickPopup = () => {
    router.push(`${pathname}?tab=popup`);
  };

  return (
    <div className="text-fg1 mx-auto flex min-h-screen max-w-prose flex-col justify-center py-4 md:py-20">
      <div className="h-[520px] space-y-10 px-4">
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
                onClick={handleClickPopup}
                className={cn(
                  'text-fg2 focus:text-fgAccent hover:text-fgAccent z-10 flex-1 cursor-pointer py-2 font-mono transition-colors',
                  selectedTab === 'popup' && 'text-fgAccent font-bold'
                )}
              >
                Popup
              </button>
            </div>
          </div>
        </div>

        {selectedTab === 'iframe' && (
          <>
            <h3 className="sr-only text-lg font-semibold">IFrame Style</h3>
            <div>
              <h4 className="text-fg0 mb-1 font-semibold">Embed code</h4>
              <pre className="border-separator2 bg-bg2 scrollbar-custom relative overflow-auto rounded-md border px-2 py-1">
                <code className="font-mono">
                  {iframeEmbedCode.split(iframeEmbedUrl).map((stringPart, index) => {
                    if (index === 0) {
                      return <span key={index}>{stringPart}</span>;
                    }

                    return (
                      <span key={index}>
                        <a
                          href={iframeEmbedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          {iframeEmbedUrl}
                        </a>
                        {stringPart}
                      </span>
                    );
                  })}
                </code>
                <div className="absolute top-0 right-0">
                  <button
                    onClick={() => copyEmbedCode(iframeEmbedCode)}
                    className="cursor-pointer p-2 opacity-50 transition-opacity hover:opacity-100"
                  >
                    {copied ? <CheckIcon weight="bold" className="text-fgSuccess" /> : <CopyIcon />}
                  </button>
                </div>
              </pre>
            </div>
            <div className="flex justify-center">
              <iframe
                src={iframeEmbedUrl}
                style={{ width: 320, height: 64 }}
                className="opacity-100 transition-opacity duration-500 [@starting-style]:opacity-0"
              />
            </div>
          </>
        )}

        {selectedTab === 'popup' && (
          <>
            <h3 className="sr-only text-lg font-semibold">Popup Style</h3>
            <div>
              <h4 className="text-fg0 mb-1 font-semibold">Embed code</h4>
              <pre className="order-separator2 bg-bg2 scrollbar-custom relative overflow-auto rounded-md border px-2 py-1">
                <code className="font-mono">{popupEmbedCode}</code>
                <div className="absolute top-0 right-0">
                  <button
                    onClick={() => copyEmbedCode(popupEmbedCode)}
                    className="cursor-pointer p-2 opacity-50 transition-opacity hover:opacity-100"
                  >
                    {copied ? <CheckIcon weight="bold" className="text-fgSuccess" /> : <CopyIcon />}
                  </button>
                </div>
              </pre>
              {/* hide build/test instructions in sandbox environment on Vercel */}
              {!IS_SANDBOX_ENVIRONMENT && (
                <div className="my-4">
                  <p className="text-fg4 overflow-hidden text-sm text-ellipsis whitespace-nowrap">
                    To apply local changes, run{' '}
                    <code className="text-fg0">pnpm build-embed-popup-script</code>.
                  </p>
                  <p className="text-fg4 overflow-hidden text-sm text-ellipsis whitespace-nowrap">
                    Test your latest build at{' '}
                    <a
                      href={popupTestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {popupTestUrl}
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-8">
              <div className="text-fgAccent flex gap-1">
                <p className="grow text-sm">
                  The popup button should appear in the bottom right corner of the screen
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
