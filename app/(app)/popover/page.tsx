'use client';

import Script from 'next/script';
import { HandPointingIcon } from '@phosphor-icons/react';

export default function PopoverPage() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Script src="/embed-popup.js" />
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
  );
}
