import { cache } from 'react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import type { AppConfig } from './types';

export const THEME_STORAGE_KEY = 'theme-mode';
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

// https://react.dev/reference/react/cache#caveats
// > React will invalidate the cache for all memoized functions for each server request.
export const getAppConfig = cache(async (): Promise<AppConfig> => {
  return APP_CONFIG_DEFAULTS;
});
