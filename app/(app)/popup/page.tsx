'use client';

import Script from 'next/script';
import { HandPointingIcon } from '@phosphor-icons/react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PopupPage() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Script src="/embed-popup.js" />
      <div className="space-y-10">
        <div className="flex justify-center">
          <ThemeToggle className="w-fit" />
        </div>
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
    </div>
  );
}
