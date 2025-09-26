import { cache } from 'react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import type { AppConfig, SandboxConfig } from './types';

export const CONFIG_ENDPOINT = process.env.NEXT_PUBLIC_APP_CONFIG_ENDPOINT;
export const SANDBOX_ID = process.env.SANDBOX_ID;

export const THEME_STORAGE_KEY = 'theme-mode';
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function getOrigin(headers: Headers): string {
  const host = headers.get('host');
  const proto = headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

export function getSandboxId(origin: string) {
  return SANDBOX_ID ?? origin.split('.')[0];
}

// https://react.dev/reference/react/cache#caveats
// > React will invalidate the cache for all memoized functions for each server request.
export const getAppConfig = cache(
  async (origin: string, sandboxIdAttribute?: string): Promise<AppConfig> => {
    if (CONFIG_ENDPOINT) {
      const sandboxId = sandboxIdAttribute ?? getSandboxId(origin);

      try {
        const response = await fetch(CONFIG_ENDPOINT, {
          cache: 'no-store',
          headers: { 'X-Sandbox-ID': sandboxId },
        });

        const remoteConfig: SandboxConfig = await response.json();
        const config: AppConfig = { ...APP_CONFIG_DEFAULTS };

        for (const [key, entry] of Object.entries(remoteConfig)) {
          if (entry === null) continue;
          if (
            key in config &&
            typeof config[key as keyof AppConfig] === entry.type &&
            typeof config[key as keyof AppConfig] === typeof entry.value
          ) {
            // @ts-expect-error I'm not sure quite how to appease TypeScript, but we've thoroughly checked types above
            config[key as keyof AppConfig] = entry.value as AppConfig[keyof AppConfig];
          }
        }

        return config;
      } catch (error) {
        console.error('!!!', error);
      }
    }

    return APP_CONFIG_DEFAULTS;
  }
);
