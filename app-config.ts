import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  sandboxId: undefined,
  agentName: undefined,
  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,
  startButtonText: 'Chat with Agent',
  companyName: 'LiveKit',
  accent: '#1fd5f9',
  accentDark: '#002cf2',
  logo: '/lk-logo.svg',
  logoDark: '/lk-logo-dark.svg',
};
