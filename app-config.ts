import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  sandboxId: undefined,
  agentName: undefined,

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  accent: '#002cf2',
  accentDark: '#1fd5f9',
};
